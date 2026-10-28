"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { getIssues } from "@/lib/queries";
import {
  assembleResponseBody,
  extentForQuote,
  validateSubmissionPositions,
  type SubmissionPositionInput,
} from "@/lib/submissions";

const REVIEWER = "Andreas";
const SOURCE_TITLE = "Candidate feedback to SmarterVote";

/**
 * Approve a candidate submission. ONE CLICK = LIVE, per the approved
 * design: candidate fields update, per-issue positions publish with
 * source_type candidate_submission, and a published candidate_responses
 * row feeds the candidate-page "What they told us" expander.
 *
 * Safety order, on purpose:
 *  1. Everything is validated BEFORE any write, so a bad row fails
 *     with the submission still 'new' (retryable) and nothing applied.
 *  2. The submission is marked 'approved' LAST, after all writes.
 *  3. Positions upsert with ignoreDuplicates on (candidate_id,
 *     issue_id) and the response insert is guarded by an exact
 *     body_text match, so a retry after a partial failure cannot
 *     duplicate published rows.
 *  4. Positions publish with source_url NULL. That is legal only
 *     because migration 43 exempts candidate_submission from
 *     published_needs_source (a direct reply IS its own source) —
 *     without migration 43 this action fails on the CHECK.
 *
 * The approval notification email is NOT sent here: the submission is
 * marked notification_status 'pending' and Muse drafts it via the
 * Gmail connector from the Support address (Andreas sends manually).
 */
export async function approveSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const db = getServiceClient();

  const { data: submission, error: subError } = await db
    .from("candidate_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (subError || !submission) {
    throw new Error("Submission not found.");
  }
  if (submission.status !== "new") {
    throw new Error(
      `Only submissions awaiting review can be approved (this one is ${submission.status}).`
    );
  }

  const { data: candidate, error: candError } = await db
    .from("candidates")
    .select("*")
    .eq("id", submission.candidate_id)
    .maybeSingle();
  if (candError || !candidate) {
    throw new Error("The roster candidate for this submission no longer exists.");
  }
  const { data: race, error: raceError } = await db
    .from("races")
    .select("*")
    .eq("id", candidate.race_id)
    .maybeSingle();
  if (raceError || !race) {
    throw new Error("The race for this submission no longer exists.");
  }
  const issues = await getIssues(race.race_type, race.municipality_id);
  const allowedSlugs = new Set(issues.map((i) => i.slug));
  const issueIdBySlug = new Map(issues.map((i) => [i.slug, i.id]));
  const issueNameBySlug: Record<string, string> = Object.fromEntries(
    issues.map((i) => [i.slug, i.name])
  );

  // 1. Validate everything before writing anything.
  const { rows, errors } = validateSubmissionPositions(submission.positions, allowedSlugs);
  if (errors.length > 0) {
    throw new Error(`Cannot approve: ${errors.join(" ")}`);
  }

  const { data: live } = await db
    .from("positions")
    .select("issue_id")
    .eq("candidate_id", candidate.id)
    .eq("status", "published");
  const liveIssueIds = new Set((live ?? []).map((p) => p.issue_id as string));

  const toInsert: SubmissionPositionInput[] = [];
  const skipped: { issue_slug: string; reason: string }[] = [];
  for (const row of rows) {
    const issueId = issueIdBySlug.get(row.issue_slug);
    if (!issueId) {
      skipped.push({ issue_slug: row.issue_slug, reason: "Issue no longer exists for this race." });
      continue;
    }
    if (liveIssueIds.has(issueId)) {
      skipped.push({
        issue_slug: row.issue_slug,
        reason: "Candidate already has a published position on this issue — existing row kept, submission row not applied.",
      });
      continue;
    }
    toInsert.push(row);
  }

  // 2. Candidate fields: only fields the candidate actually filled.
  // Blank means "leave the current one". Socials merge key-wise so a
  // candidate who only gives an Instagram does not wipe a Facebook.
  const candidatePatch: Record<string, unknown> = {};
  if (submission.bio) candidatePatch.bio = submission.bio;
  if (submission.website) candidatePatch.website = submission.website;
  if (submission.public_email) candidatePatch.email = submission.public_email;
  const submittedSocials = (submission.socials ?? {}) as Record<string, string>;
  const filledSocials = Object.fromEntries(
    Object.entries(submittedSocials).filter(([, v]) => Boolean(v))
  );
  if (Object.keys(filledSocials).length > 0) {
    candidatePatch.socials = { ...(candidate.socials ?? {}), ...filledSocials };
  }
  if (Object.keys(candidatePatch).length > 0) {
    const { error } = await db
      .from("candidates")
      .update(candidatePatch)
      .eq("id", candidate.id);
    if (error) throw new Error(`Could not update the candidate: ${error.message}`);
  }

  // 3. Positions, published at once (migration 43 covers the NULL URL).
  if (toInsert.length > 0) {
    const positionRows = toInsert.map((r) => ({
      candidate_id: candidate.id,
      issue_id: issueIdBySlug.get(r.issue_slug),
      summary_short: r.summary_short,
      summary_bullets: r.summary_bullets,
      verbatim_quote: r.verbatim_quote,
      source_url: null,
      source_title: SOURCE_TITLE,
      source_type: "candidate_submission",
      source_date: String(submission.submitted_at).slice(0, 10),
      source_extent: extentForQuote(r.verbatim_quote),
      confidence: "high",
      status: "published",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    }));
    const { error } = await db
      .from("positions")
      .upsert(positionRows, { onConflict: "candidate_id,issue_id", ignoreDuplicates: true });
    if (error) throw new Error(`Could not publish positions: ${error.message}`);
  }

  // 4. Full-text response for the candidate-page expander, guarded
  // against duplicate insert on retry (exact body_text match).
  if (toInsert.length > 0) {
    const { body_text, sections } = assembleResponseBody(
      candidate.slug,
      toInsert,
      issueNameBySlug
    );
    const { data: existingResponse } = await db
      .from("candidate_responses")
      .select("id")
      .eq("candidate_id", candidate.id)
      .eq("status", "published")
      .eq("body_text", body_text)
      .maybeSingle();
    if (!existingResponse) {
      const { error } = await db.from("candidate_responses").insert({
        candidate_id: candidate.id,
        received_at: String(submission.submitted_at).slice(0, 10),
        status: "published",
        subject: null,
        body_text,
        sections,
        reviewed_by: REVIEWER,
        reviewed_at: new Date().toISOString(),
      });
      if (error) throw new Error(`Could not publish the full response: ${error.message}`);
    }
  }

  // 5. Mark approved LAST. notification_status 'pending' is the signal
  // for Muse to draft (never send) the approval notification email.
  const { error } = await db
    .from("candidate_submissions")
    .update({
      status: "approved",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
      notification_status: "pending",
      skipped_positions: skipped,
    })
    .eq("id", id)
    .eq("status", "new");
  if (error) throw new Error(`Could not mark the submission approved: ${error.message}`);

  revalidatePath("/admin/submissions");
  revalidatePath("/races", "layout");
}

/** Reject: marks the row rejected with an optional note. Nothing else changes. */
export async function rejectSubmissionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("review_note") ?? "").trim();
  const db = getServiceClient();
  const { data: submission } = await db
    .from("candidate_submissions")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!submission) throw new Error("Submission not found.");
  if (submission.status !== "new" && submission.status !== "pending_confirmation") {
    throw new Error(`Only pending submissions can be rejected (this one is ${submission.status}).`);
  }
  const { error } = await db
    .from("candidate_submissions")
    .update({
      status: "rejected",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
      review_note: note || null,
    })
    .eq("id", id);
  if (error) throw new Error(`Could not reject the submission: ${error.message}`);
  revalidatePath("/admin/submissions");
}

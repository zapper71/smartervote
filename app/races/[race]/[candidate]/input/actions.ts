"use server";

import { getPublicClient, getServiceClient } from "@/lib/supabase";
import { getCandidate, getIssues } from "@/lib/queries";
import {
  isDuplicatePosition,
  looksLikeEmail,
  validateSubmissionPositions,
  type SubmissionPositionInput,
} from "@/lib/submissions";

export interface SubmitReport {
  ok: boolean;
  /** True when the submission is waiting on the confirmation email. */
  needsConfirmation: boolean;
  /** True when there was no roster email, so this goes manual. */
  manual: boolean;
  skippedDuplicates: number;
  positionCount: number;
  errors: string[];
}

const INITIAL: SubmitReport = {
  ok: false,
  needsConfirmation: false,
  manual: false,
  skippedDuplicates: 0,
  positionCount: 0,
  errors: [],
};

/**
 * Public submission. Writes ONLY to candidate_submissions, through the
 * anon client so the migration-42 RLS policy is the backstop (anon may
 * INSERT, never SELECT/UPDATE/DELETE). The service client is used only
 * for server-side reads (supersede + dedupe) — it never reaches the
 * browser.
 *
 * The confirmation email is NOT sent here: the app holds no mail
 * credential. A pending_confirmation row waits for the Muse-side
 * Gmail-connector sweep, which generates the token, stores its hash +
 * expiry, stamps confirmation_sent_at and sends the link to the roster
 * address. See supabase/42_candidate_submissions.sql.
 *
 * NO PHOTO FIELD, by standing rule (Oct 28, 2026): photo uploads are
 * never accepted on this form — photos influence perception rather
 * than positions. Do not add one here.
 */
export async function submitSubmissionAction(
  _prev: SubmitReport,
  formData: FormData
): Promise<SubmitReport> {
  const raceSlug = String(formData.get("race_slug") ?? "");
  const candidateSlug = String(formData.get("candidate_slug") ?? "");
  const found = await getCandidate(raceSlug, candidateSlug);
  if (!found) {
    return { ...INITIAL, errors: ["That candidate could not be found."] };
  }
  const { race, candidate } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const allowedSlugs = new Set(issues.map((i) => i.slug));

  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const publicEmailRaw = String(formData.get("public_email") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const socials: Record<string, string> = {};
  for (const key of ["facebook", "instagram", "x"]) {
    const v = String(formData.get(`social_${key}`) ?? "").trim();
    if (v) socials[key] = v;
  }

  const errors: string[] = [];
  if (!contactEmail || !looksLikeEmail(contactEmail)) {
    errors.push("A contact email address is required.");
  }
  if (publicEmailRaw && !looksLikeEmail(publicEmailRaw)) {
    errors.push("The public campaign email does not look like an email address.");
  }

  const parsed: SubmissionPositionInput[] = [];
  for (const issue of issues) {
    const summary = String(formData.get(`summary_${issue.slug}`) ?? "").trim();
    const quote = String(formData.get(`quote_${issue.slug}`) ?? "").trim();
    const bullets = String(formData.get(`bullets_${issue.slug}`) ?? "")
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    if (!summary && !quote && bullets.length === 0) continue;
    parsed.push({
      issue_slug: issue.slug,
      summary_short: summary,
      summary_bullets: bullets,
      verbatim_quote: quote,
    });
  }
  const { rows, errors: positionErrors } = validateSubmissionPositions(parsed, allowedSlugs);
  errors.push(...positionErrors);

  const hasFieldChange =
    Boolean(bio || website || publicEmailRaw || Object.keys(socials).length > 0);
  if (!hasFieldChange && rows.length === 0) {
    errors.push("Nothing to submit — fill in at least one field or one position.");
  }
  if (errors.length > 0) {
    return { ...INITIAL, errors };
  }

  const db = getServiceClient();
  // One live submission per candidate: a resubmission supersedes any
  // still-pending one so corrections don't stack in the queue.
  await db
    .from("candidate_submissions")
    .update({ status: "rejected", review_note: "Superseded by a newer submission." })
    .eq("candidate_id", candidate.id)
    .in("status", ["pending_confirmation", "new"]);

  // Dedupe against live published positions and still-pending staged
  // rows: an exact duplicate (same issue, quote, summary) is dropped
  // here and counted, not queued twice.
  const existing: { issue_slug: string; verbatim_quote: string; summary_short: string }[] = [];
  const { data: live } = await db
    .from("positions")
    .select("summary_short, verbatim_quote, issues(slug)")
    .eq("candidate_id", candidate.id)
    .eq("status", "published");
  for (const p of (live ?? []) as unknown as {
    summary_short: string | null;
    verbatim_quote: string | null;
    issues: { slug: string } | { slug: string }[] | null;
  }[]) {
    const slug = Array.isArray(p.issues) ? p.issues[0]?.slug : p.issues?.slug;
    if (slug) {
      existing.push({
        issue_slug: slug,
        verbatim_quote: p.verbatim_quote ?? "",
        summary_short: p.summary_short ?? "",
      });
    }
  }
  const { data: staged } = await db
    .from("candidate_submissions")
    .select("positions")
    .eq("candidate_id", candidate.id)
    .in("status", ["pending_confirmation", "new"]);
  for (const s of (staged ?? []) as { positions: SubmissionPositionInput[] }[]) {
    for (const r of Array.isArray(s.positions) ? s.positions : []) {
      existing.push({
        issue_slug: r.issue_slug,
        verbatim_quote: r.verbatim_quote,
        summary_short: r.summary_short,
      });
    }
  }
  const kept: SubmissionPositionInput[] = [];
  let skippedDuplicates = 0;
  for (const row of rows) {
    if (isDuplicatePosition(row, existing)) skippedDuplicates += 1;
    else kept.push(row);
  }

  // Roster email present -> confirmation flow; absent -> manual path.
  // The token itself is minted by the confirmation-email sweep, not
  // here (see the header comment): the hash stays NULL until then.
  const rosterEmail = candidate.email ?? null;
  const status = rosterEmail ? "pending_confirmation" : "new";
  const pub = getPublicClient();
  if (!pub) {
    return { ...INITIAL, errors: ["The submission service is not configured right now."] };
  }
  const { error } = await pub.from("candidate_submissions").insert({
    candidate_id: candidate.id,
    contact_email: contactEmail,
    public_email: publicEmailRaw || null,
    bio: bio || null,
    website: website || null,
    socials,
    positions: kept,
    status,
    manual_verification: !rosterEmail,
  });
  if (error) {
    return { ...INITIAL, errors: [`Could not save the submission: ${error.message}`] };
  }
  return {
    ok: true,
    needsConfirmation: status === "pending_confirmation",
    manual: status === "new",
    skippedDuplicates,
    positionCount: kept.length,
    errors: [],
  };
}

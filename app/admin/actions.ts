"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { passwordMatches, requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import { allowedExtents, type SourceExtent, type SourceType } from "@/lib/types";

const REVIEWER = "Andreas";

/**
 * Validate a source_extent against the row it is going on.
 *
 * Re-checked here rather than trusted from the form, because a dropdown is a
 * suggestion and a POST body is whatever someone sends. The rule being
 * enforced is the one that keeps this feature fair: a position reported by a
 * journalist can never be labelled with a length, since the length was the
 * journalist's choice, not the candidate's.
 *
 * Returns the value to store, or throws with a message worth reading.
 */
async function validatedExtent(
  db: ReturnType<typeof getServiceClient>,
  positionId: string,
  raw: FormDataEntryValue | null
): Promise<SourceExtent | null> {
  const value = String(raw ?? "").trim();
  if (value === "") return null; // "Not recorded" is always allowed.

  const { data, error } = await db
    .from("positions")
    .select("source_type")
    .eq("id", positionId)
    .single();
  if (error) throw new Error(`Could not read the position: ${error.message}`);

  const permitted = allowedExtents(data?.source_type as SourceType | null);
  if (!permitted.includes(value as SourceExtent)) {
    throw new Error(
      `"${value}" can't be used on a position sourced from ${data?.source_type ?? "an unknown source"}. ` +
        `Allowed here: ${permitted.join(", ")}.`
    );
  }
  return value as SourceExtent;
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const dest = next.startsWith("/admin") ? next : "/admin";
  if (!passwordMatches(password)) {
    redirect(`${dest}?error=1`);
  }
  await signIn();
  redirect(dest);
}

export async function logoutAction() {
  await signOut();
  redirect("/admin");
}

/**
 * Publish a position.
 *
 * The database constraint `published_needs_source` will reject this if the
 * row somehow lacks a quote and source — that check is deliberately NOT
 * duplicated here. One rule, enforced in one place, that cannot be bypassed
 * by a future code path that forgets about it.
 */
export async function approveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const edited = formData.get("summary_short");

  const db = getServiceClient();
  const patch: Record<string, unknown> = {
    status: "published",
    reviewed_by: REVIEWER,
    reviewed_at: new Date().toISOString(),
  };
  // Edit-and-approve: if the textarea was changed, save the edit too.
  if (typeof edited === "string" && edited.trim().length > 0) {
    patch.summary_short = edited.trim();
  }

  // How much the candidate published on this issue. Only set when the form
  // sent the field at all, so an older form can't silently blank it.
  if (formData.has("source_extent")) {
    patch.source_extent = await validatedExtent(db, id, formData.get("source_extent"));
  }

  const { error } = await db.from("positions").update(patch).eq("id", id);
  if (error) throw new Error(`Could not publish: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

export async function rejectAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({
      status: "draft",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not reject: ${error.message}`);

  revalidatePath("/admin");
}

/**
 * Set or change source_extent on a position that is already published.
 *
 * Exists so the second pass over the 47 already-live positions can be done
 * in the review screen instead of by hand-writing UPDATE statements. Nothing
 * else about the row changes, and it does not touch reviewed_at — recording
 * how long a source was is not a re-review of its content.
 */
export async function setExtentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const extent = await validatedExtent(db, id, formData.get("source_extent"));

  const { error } = await db
    .from("positions")
    .update({ source_extent: extent })
    .eq("id", id);
  if (error) throw new Error(`Could not save: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/**
 * Publish a candidate's full response ("What [Name] told us").
 *
 * The response publishes verbatim — there is no editing it, only reading
 * it. If the text is wrong, reject it and fix the import; a published reply
 * is the candidate's own words and must stay exactly theirs.
 */
export async function approveResponseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("candidate_responses")
    .update({
      status: "published",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not publish the response: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/**
 * Send a response back to draft.
 *
 * Requires supabase/19_candidate_response_review.sql (adds 'draft' to the
 * status check). Without it this fails on the constraint — which is the
 * safe direction to fail in.
 */
export async function rejectResponseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("candidate_responses")
    .update({
      status: "draft",
      reviewed_by: REVIEWER,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not reject the response: ${error.message}`);

  revalidatePath("/admin");
}

/** Pull a published position back off the site. */
export async function unpublishAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({ status: "in_review" })
    .eq("id", id);
  if (error) throw new Error(`Could not unpublish: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/** Pull a published response back off the site. */
export async function unpublishResponseAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const { error } = await db
    .from("candidate_responses")
    .update({ status: "in_review" })
    .eq("id", id);
  if (error) throw new Error(`Could not unpublish the response: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

// ---------------------------------------------------------------------
// JSON import: paste staged content into the review queue.
// ---------------------------------------------------------------------

/**
 * The report shown after an import. Serializable by construction — it
 * travels back to the client component through useActionState.
 */
export interface ImportReport {
  ok: boolean;
  positionsImported: number;
  positionsSkipped: string[];
  responsesImported: number;
  responsesSkipped: string[];
  warnings: string[];
  errors: string[];
}

const EMPTY_REPORT: ImportReport = {
  ok: false,
  positionsImported: 0,
  positionsSkipped: [],
  responsesImported: 0,
  responsesSkipped: [],
  warnings: [],
  errors: [],
};

/** Refuse absurd pastes before parsing. 500KB is thousands of positions. */
const MAX_IMPORT_CHARS = 500_000;

/** Must match the positions source_type CHECK constraint. */
const SOURCE_TYPES = [
  "candidate_website",
  "candidate_social",
  "local_news",
  "all_candidates_meeting",
  "candidate_submission",
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function isDateString(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v))
  );
}

/**
 * Import positions and candidate responses from pasted JSON.
 *
 * Everything lands as status='in_review'. This action STAGES — it never
 * publishes. Publishing still happens one explicit click at a time in the
 * review queue, which is the entire point of the site.
 *
 * Expected shape:
 *   { "positions": [ { candidate, issue, summary_short, summary_bullets,
 *                      verbatim_quote, source_url, source_title, source_type,
 *                      source_date, source_extent, model_confidence,
 *                      no_public_position } ],
 *     "responses": [ { candidate, received_at, subject, body_text,
 *                      sections: [ { heading, anchor, issue_slug } ] } ] }
 * Slugs, not UUIDs — the action resolves them. A bare array is treated as
 * positions, for the common case.
 *
 * Validation mirrors the database constraints (published_needs_source, the
 * source_type and source_extent checks, the dedupe index) so that anything
 * that imports cleanly can actually be published from the queue.
 */
export async function importJsonAction(
  _prev: ImportReport,
  formData: FormData
): Promise<ImportReport> {
  await requireAdmin();
  const report: ImportReport = {
    ...EMPTY_REPORT,
    positionsSkipped: [],
    responsesSkipped: [],
    warnings: [],
    errors: [],
  };

  const raw = String(formData.get("payload") ?? "");
  if (raw.trim().length === 0) {
    return { ...report, errors: ["Nothing pasted."] };
  }
  if (raw.length > MAX_IMPORT_CHARS) {
    return {
      ...report,
      errors: [
        `That paste is ${(raw.length / 1024).toFixed(0)}KB — the limit is 500KB. Split it into smaller imports.`,
      ],
    };
  }

  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch (e) {
    return {
      ...report,
      errors: [`Not valid JSON: ${e instanceof Error ? e.message : String(e)}`],
    };
  }

  const positionsRaw: unknown[] = Array.isArray(doc)
    ? doc
    : isRecord(doc) && Array.isArray(doc.positions)
      ? (doc.positions as unknown[])
      : [];
  const responsesRaw: unknown[] =
    isRecord(doc) && Array.isArray(doc.responses)
      ? (doc.responses as unknown[])
      : [];
  if (
    !Array.isArray(doc) &&
    !(
      isRecord(doc) &&
      (Array.isArray(doc.positions) || Array.isArray(doc.responses))
    )
  ) {
    return {
      ...report,
      errors: [
        'Expected an object with "positions" and/or "responses" arrays, or a bare array of positions.',
      ],
    };
  }

  const db = getServiceClient();

  // Resolve slugs once, up front — every row then validates against maps.
  const { data: candRows, error: candErr } = await db
    .from("candidates")
    .select("id,slug");
  if (candErr)
    return { ...report, errors: [`Could not read candidates: ${candErr.message}`] };
  const { data: issueRows, error: issueErr } = await db
    .from("issues")
    .select("id,slug");
  if (issueErr)
    return { ...report, errors: [`Could not read issues: ${issueErr.message}`] };
  const candBySlug = new Map((candRows ?? []).map((c) => [c.slug, c.id] as const));
  const issueBySlug = new Map((issueRows ?? []).map((i) => [i.slug, i.id] as const));

  // ---- positions: validate everything before touching the table ----
  type StagedPosition = {
    label: string;
    candidate_id: string;
    issue_id: string;
    summary_short: string | null;
    summary_bullets: string[] | null;
    verbatim_quote: string | null;
    source_url: string | null;
    source_title: string | null;
    source_type: string;
    source_date: string | null;
    source_extent: string | null;
    model_confidence: number | null;
    no_public_position: boolean;
  };
  const staged: StagedPosition[] = [];

  positionsRaw.forEach((p, idx) => {
    const label = `positions[${idx}]`;
    if (!isRecord(p)) {
      report.errors.push(`${label}: not an object.`);
      return;
    }
    const candSlug = asString(p.candidate);
    const issueSlug = asString(p.issue);
    const candidate_id = candSlug ? candBySlug.get(candSlug) : undefined;
    const issue_id = issueSlug ? issueBySlug.get(issueSlug) : undefined;
    if (!candidate_id) {
      report.errors.push(`${label}: unknown candidate slug ${JSON.stringify(candSlug)}.`);
      return;
    }
    if (!issue_id) {
      report.errors.push(`${label}: unknown issue slug ${JSON.stringify(issueSlug)}.`);
      return;
    }
    const source_type = asString(p.source_type);
    if (!source_type || !(SOURCE_TYPES as readonly string[]).includes(source_type)) {
      report.errors.push(
        `${label}: source_type must be one of ${SOURCE_TYPES.join(", ")}.`
      );
      return;
    }
    const source_extent = asString(p.source_extent);
    if (
      source_extent !== null &&
      !allowedExtents(source_type as SourceType).includes(
        source_extent as SourceExtent
      )
    ) {
      report.errors.push(
        `${label}: source_extent ${JSON.stringify(source_extent)} is not allowed for ${source_type}.`
      );
      return;
    }
    // Mirror published_needs_source, so imported rows are publishable.
    const no_public_position = p.no_public_position === true;
    const verbatim_quote = asString(p.verbatim_quote);
    const source_url = asString(p.source_url);
    if (!no_public_position && !verbatim_quote) {
      report.errors.push(
        `${label}: verbatim_quote is required (or set no_public_position: true).`
      );
      return;
    }
    if (!no_public_position && !source_url && source_type !== "candidate_submission") {
      report.errors.push(
        `${label}: source_url is required for ${source_type} — replies sent to us directly use source_type "candidate_submission".`
      );
      return;
    }
    const model_confidence = p.model_confidence;
    if (
      model_confidence !== undefined &&
      (typeof model_confidence !== "number" ||
        model_confidence < 0 ||
        model_confidence > 1)
    ) {
      report.errors.push(`${label}: model_confidence must be between 0 and 1.`);
      return;
    }
    const bullets = p.summary_bullets;
    if (
      bullets !== undefined &&
      (!Array.isArray(bullets) || !bullets.every((b) => typeof b === "string"))
    ) {
      report.errors.push(`${label}: summary_bullets must be an array of strings.`);
      return;
    }
    const summary_short = asString(p.summary_short);
    if (summary_short && summary_short.length > 160) {
      report.warnings.push(
        `${label}: summary_short is ${summary_short.length} chars — the site shows about 140.`
      );
    }
    const source_date = asString(p.source_date);
    if (source_date !== null && !isDateString(source_date)) {
      report.errors.push(`${label}: source_date must be YYYY-MM-DD.`);
      return;
    }
    staged.push({
      label,
      candidate_id,
      issue_id,
      summary_short,
      summary_bullets: Array.isArray(bullets) ? (bullets as string[]) : null,
      verbatim_quote,
      source_url,
      source_title: asString(p.source_title),
      source_type,
      source_date,
      source_extent,
      model_confidence:
        typeof model_confidence === "number" ? model_confidence : null,
      no_public_position,
    });
  });

  // Dedupe against the unique index (candidate, issue, source_url) before
  // inserting, so a double-pasted import is a no-op with a clear report.
  const seenKeys = new Set<string>();
  if (staged.length > 0) {
    const { data: existing, error: existErr } = await db
      .from("positions")
      .select("candidate_id,issue_id,source_url")
      .in(
        "candidate_id",
        [...new Set(staged.map((s) => s.candidate_id))]
      );
    if (existErr) {
      return { ...report, errors: [`Could not check for duplicates: ${existErr.message}`] };
    }
    for (const e of existing ?? []) {
      seenKeys.add(`${e.candidate_id}|${e.issue_id}|${e.source_url ?? ""}`);
    }
  }
  for (const s of staged) {
    const key = `${s.candidate_id}|${s.issue_id}|${s.source_url ?? ""}`;
    if (seenKeys.has(key)) {
      report.positionsSkipped.push(`${s.label}: already in the database.`);
      continue;
    }
    const { error } = await db.from("positions").insert({
      candidate_id: s.candidate_id,
      issue_id: s.issue_id,
      summary_short: s.summary_short,
      summary_bullets: s.summary_bullets,
      verbatim_quote: s.verbatim_quote,
      source_url: s.source_url,
      source_title: s.source_title,
      source_type: s.source_type,
      source_date: s.source_date,
      source_extent: s.source_extent,
      model_confidence: s.model_confidence,
      no_public_position: s.no_public_position,
      status: "in_review",
    });
    if (error) {
      report.errors.push(`${s.label}: ${error.message}`);
    } else {
      report.positionsImported += 1;
      seenKeys.add(key);
    }
  }

  // ---- responses: validate, then insert ----
  type StagedResponse = {
    label: string;
    candidate_id: string;
    candidate_slug: string;
    received_at: string;
    subject: string | null;
    body_text: string;
    sections: { heading: string; anchor: string; issue_slug: string | null }[];
  };
  const stagedResp: StagedResponse[] = [];

  responsesRaw.forEach((r, idx) => {
    const label = `responses[${idx}]`;
    if (!isRecord(r)) {
      report.errors.push(`${label}: not an object.`);
      return;
    }
    const candSlug = asString(r.candidate);
    const candidate_id = candSlug ? candBySlug.get(candSlug) : undefined;
    if (!candidate_id || !candSlug) {
      report.errors.push(`${label}: unknown candidate slug ${JSON.stringify(candSlug)}.`);
      return;
    }
    const body_text = asString(r.body_text);
    if (!body_text || body_text.trim().length === 0) {
      report.errors.push(`${label}: body_text is required.`);
      return;
    }
    const received_at = asString(r.received_at);
    if (!received_at || !isDateString(received_at)) {
      report.errors.push(`${label}: received_at must be a valid YYYY-MM-DD date.`);
      return;
    }
    const sections: StagedResponse["sections"] = [];
    if (r.sections !== undefined) {
      if (!Array.isArray(r.sections)) {
        report.errors.push(`${label}: sections must be an array.`);
        return;
      }
      for (let si = 0; si < r.sections.length; si++) {
        const s = r.sections[si];
        if (!isRecord(s)) {
          report.errors.push(`${label}.sections[${si}]: not an object.`);
          return;
        }
        const heading = asString(s.heading);
        const anchor = asString(s.anchor);
        if (!heading || !anchor) {
          report.errors.push(
            `${label}.sections[${si}]: heading and anchor are both required.`
          );
          return;
        }
        const isl = asString(s.issue_slug);
        if (isl !== null && !issueBySlug.has(isl)) {
          report.errors.push(
            `${label}.sections[${si}]: unknown issue_slug ${JSON.stringify(isl)}.`
          );
          return;
        }
        sections.push({ heading, anchor, issue_slug: isl });
      }
    }
    stagedResp.push({
      label,
      candidate_id,
      candidate_slug: candSlug,
      received_at,
      subject: asString(r.subject),
      body_text,
      sections,
    });
  });

  const respSeen = new Set<string>();
  if (stagedResp.length > 0) {
    const { data: existingResp, error: existErr } = await db
      .from("candidate_responses")
      .select("candidate_id")
      .in(
        "candidate_id",
        [...new Set(stagedResp.map((s) => s.candidate_id))]
      )
      .in("status", ["draft", "in_review", "published"]);
    if (existErr) {
      return { ...report, errors: [`Could not check for duplicate responses: ${existErr.message}`] };
    }
    for (const e of existingResp ?? []) respSeen.add(e.candidate_id);
  }
  for (const s of stagedResp) {
    if (respSeen.has(s.candidate_id)) {
      report.responsesSkipped.push(
        `${s.label}: ${s.candidate_slug} already has a response in the database.`
      );
      continue;
    }
    const { error } = await db.from("candidate_responses").insert({
      candidate_id: s.candidate_id,
      received_at: s.received_at,
      subject: s.subject,
      body_text: s.body_text,
      sections: s.sections,
      status: "in_review",
    });
    if (error) {
      report.errors.push(`${s.label}: ${error.message}`);
    } else {
      report.responsesImported += 1;
      respSeen.add(s.candidate_id);
    }
  }

  report.ok = report.errors.length === 0;
  if (report.positionsImported > 0 || report.responsesImported > 0) {
    revalidatePath("/admin");
  }
  return report;
}

/**
 * Approve everything currently in review for one candidate.
 *
 * Covers their positions AND their full response, if one is waiting — the
 * response is shown in the same candidate group, so "approve all" approving
 * only half of what you're looking at would be a trap.
 *
 * Scoped to a single candidate on purpose. A global "approve all" button is
 * exactly the thing you click at 11pm without reading, and the whole premise
 * of this site is that a person read every line.
 */
export async function bulkApproveCandidateAction(formData: FormData) {
  await requireAdmin();
  const candidateId = String(formData.get("candidate_id"));
  const now = new Date().toISOString();

  const db = getServiceClient();
  const { error } = await db
    .from("positions")
    .update({
      status: "published",
      reviewed_by: REVIEWER,
      reviewed_at: now,
    })
    .eq("candidate_id", candidateId)
    .eq("status", "in_review");
  if (error) throw new Error(`Could not bulk approve: ${error.message}`);

  const { error: respError } = await db
    .from("candidate_responses")
    .update({ status: "published", reviewed_by: REVIEWER, reviewed_at: now })
    .eq("candidate_id", candidateId)
    .eq("status", "in_review");
  if (respError)
    throw new Error(`Positions published, but the response failed: ${respError.message}`);

  revalidatePath("/admin");
  revalidatePath("/races", "layout");
}

/**
 * Record what you decided about a correction.
 *
 * Deliberately does NOT send an email. A site that auto-replies to candidates
 * during an election is one bad template away from an embarrassment, and the
 * reply is exactly the part that deserves a human. This records the decision
 * so nothing gets lost; you send the actual message yourself.
 */
export async function resolveCorrectionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const note = String(formData.get("resolution_note") ?? "").trim();

  if (!["accepted", "rejected", "needs_info"].includes(status)) {
    throw new Error(`Unexpected status: ${status}`);
  }

  const db = getServiceClient();
  const { error } = await db
    .from("corrections")
    .update({
      status,
      resolution_note: note || null,
      resolved_at: status === "needs_info" ? null : new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`Could not update correction: ${error.message}`);

  revalidatePath("/admin/corrections");
}

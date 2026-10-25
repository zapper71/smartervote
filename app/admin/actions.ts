"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { passwordMatches, requireAdmin, signIn, signOut } from "@/lib/admin-auth";
import {
  allowedExtents,
  CONFIDENCE_LEVELS,
  confidenceForSourceType,
  type Confidence,
  type SourceExtent,
  type SourceType,
} from "@/lib/types";

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

  // Confidence in the position. Same "only when sent" rule; validated
  // against the fixed vocabulary rather than trusted from the form.
  if (formData.has("confidence")) {
    const raw = String(formData.get("confidence") ?? "");
    if (!(CONFIDENCE_LEVELS as readonly string[]).includes(raw)) {
      throw new Error(`"${raw}" is not a confidence level. Use low, medium or high.`);
    }
    patch.confidence = raw as Confidence;
  }

  const { error } = await db.from("positions").update(patch).eq("id", id);
  if (error) {
    if (/confidence/i.test(error.message)) throw missingConfidenceColumnError();
    throw new Error(`Could not publish: ${error.message}`);
  }

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
 * The readable error when a confidence write lands on a database that does
 * not have the column yet (migration 22 not run). Failing here with words
 * beats silently succeeding without writing — and beats a raw Postgres
 * error nobody should have to decode.
 */
function missingConfidenceColumnError(): Error {
  return new Error(
    "The confidence column isn't in the database yet — run supabase/22_position_confidence.sql first. Nothing was saved."
  );
}

/**
 * Set or change confidence on a single position.
 *
 * Mirrors setExtentAction: one field, nothing else about the row changes,
 * no re-review. Available both on the in-review form (saved with approval)
 * and on published rows below.
 */
export async function setConfidenceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const db = getServiceClient();
  const raw = String(formData.get("confidence") ?? "");
  if (!(CONFIDENCE_LEVELS as readonly string[]).includes(raw)) {
    throw new Error(`"${raw}" is not a confidence level. Use low, medium or high.`);
  }

  const { error } = await db
    .from("positions")
    .update({ confidence: raw as Confidence })
    .eq("id", id);
  if (error) {
    if (/confidence/i.test(error.message)) throw missingConfidenceColumnError();
    throw new Error(`Could not save: ${error.message}`);
  }

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
  "candidate_questionnaire",
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
  //
  // Issue slugs repeat per municipality (the province-wide issue set is
  // cloned for each of the 265+ municipalities), so a global issue lookup
  // is ambiguous. Issues are resolved scoped to the CANDIDATE's
  // municipality: candidate -> race -> municipality_id, then issue by
  // (municipality_id, slug). Huntsville resolves exactly as before — its
  // candidates map to its own municipality.
  // PostgREST caps a single response at 1,000 rows. With 6,800+ candidates
  // and 2,200+ races now in the database, an unpaginated select silently
  // truncates — every candidate past the cap came back "unknown candidate
  // slug" (Bracebridge was the first import to hit it, Oct 17). Page
  // through all three lookup tables in 1,000-row ranges.
  const PAGE_SIZE = 1000;
  type CandRow = { id: string; slug: string; race_id: string };
  const candRows: CandRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error: candErr } = await db
      .from("candidates")
      .select("id,slug,race_id")
      .range(from, from + PAGE_SIZE - 1);
    if (candErr)
      return { ...report, errors: [`Could not read candidates: ${candErr.message}`] };
    candRows.push(...((data ?? []) as CandRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  type RaceRow = { id: string; municipality_id: string };
  const raceRows: RaceRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error: raceErr } = await db
      .from("races")
      .select("id,municipality_id")
      .range(from, from + PAGE_SIZE - 1);
    if (raceErr)
      return { ...report, errors: [`Could not read races: ${raceErr.message}`] };
    raceRows.push(...((data ?? []) as RaceRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  type IssueRow = { id: string; slug: string; municipality_id: string };
  const issueRows: IssueRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error: issueErr } = await db
      .from("issues")
      .select("id,slug,municipality_id")
      .range(from, from + PAGE_SIZE - 1);
    if (issueErr)
      return { ...report, errors: [`Could not read issues: ${issueErr.message}`] };
    issueRows.push(...((data ?? []) as IssueRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  const muniByRaceId = new Map(
    (raceRows ?? []).map((r) => [r.id, r.municipality_id] as const)
  );
  const candBySlug = new Map(
    (candRows ?? []).map(
      (c) =>
        [
          c.slug,
          { id: c.id, municipality_id: muniByRaceId.get(c.race_id) ?? null },
        ] as const
    )
  );
  const issueByMuniSlug = new Map(
    (issueRows ?? []).map(
      (i) => [`${i.municipality_id}|${i.slug}`, i.id] as const
    )
  );
  /** The issue id for this slug within the candidate's municipality. */
  const issueForCandidate = (
    cand: { municipality_id: string | null },
    issueSlug: string | null
  ): string | undefined =>
    cand.municipality_id && issueSlug
      ? issueByMuniSlug.get(`${cand.municipality_id}|${issueSlug}`)
      : undefined;

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
    confidence: Confidence;
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
    const cand = candSlug ? candBySlug.get(candSlug) : undefined;
    if (!cand) {
      report.errors.push(`${label}: unknown candidate slug ${JSON.stringify(candSlug)}.`);
      return;
    }
    const candidate_id = cand.id;
    if (!cand.municipality_id) {
      report.errors.push(
        `${label}: candidate ${JSON.stringify(candSlug)} has no municipality — the issue can't be scoped.`
      );
      return;
    }
    const issue_id = issueForCandidate(cand, issueSlug);
    if (!issue_id) {
      report.errors.push(
        `${label}: unknown issue slug ${JSON.stringify(issueSlug)} for this candidate's municipality.`
      );
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
      // Confidence starts from the source type: approved-source quotes
      // enter as high, everything else at medium — the default when
      // uncertain — for Andreas to review in the queue.
      confidence: confidenceForSourceType(source_type as SourceType),
    });
  });

  // Dedupe key matches the database unique index from migration 30:
  // (candidate_id, issue_id, source_url, verbatim_quote, summary_short).
  // Distinct statements sharing one source page differ by quote/summary,
  // so only re-importing the same statement hits the same key.
  const dedupeKey = (
    candidate_id: string,
    issue_id: string,
    source_url: string | null,
    verbatim_quote: string | null,
    summary_short: string | null
  ): string =>
    [candidate_id, issue_id, source_url ?? "", verbatim_quote ?? "", summary_short ?? ""].join("|");

  // Dedupe against the unique index
  // (candidate_id, issue_id, source_url, quote hash, summary hash) before
  // inserting, so a double-pasted import is a no-op with a clear report.
  //
  // Distinct statements that share one source page — e.g. several survey
  // answers from the same questionnaire, or several bullet points from one
  // platform page — now import as SEPARATE rows. Only a true re-import of
  // the same statement (same verbatim quote AND same summary) is skipped.
  //
  // The confidence column is new (migration 22): probe for it first and
  // leave it out of the insert when it isn't there yet, rather than
  // failing the whole import on an unknown column.
  let confidenceColumn = true;
  if (staged.length > 0) {
    const { error: probeErr } = await db
      .from("positions")
      .select("confidence")
      .limit(0);
    if (probeErr && /confidence/i.test(probeErr.message)) confidenceColumn = false;
  }
  const seenKeys = new Set<string>();
  if (staged.length > 0) {
    const { data: existing, error: existErr } = await db
      .from("positions")
      .select("candidate_id,issue_id,source_url,verbatim_quote,summary_short")
      .in(
        "candidate_id",
        [...new Set(staged.map((s) => s.candidate_id))]
      );
    if (existErr) {
      return { ...report, errors: [`Could not check for duplicates: ${existErr.message}`] };
    }
    for (const e of existing ?? []) {
      seenKeys.add(dedupeKey(e.candidate_id, e.issue_id, e.source_url, e.verbatim_quote, e.summary_short));
    }
  }
  for (const s of staged) {
    const key = dedupeKey(s.candidate_id, s.issue_id, s.source_url, s.verbatim_quote, s.summary_short);
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
      ...(confidenceColumn ? { confidence: s.confidence } : {}),
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
    const cand = candSlug ? candBySlug.get(candSlug) : undefined;
    if (!cand || !candSlug) {
      report.errors.push(`${label}: unknown candidate slug ${JSON.stringify(candSlug)}.`);
      return;
    }
    const candidate_id = cand.id;
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
        if (isl !== null && !issueForCandidate(cand, isl)) {
          report.errors.push(
            `${label}.sections[${si}]: unknown issue_slug ${JSON.stringify(isl)} for this candidate's municipality.`
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
 * Scoped to a single candidate on purpose. The queue-wide version below
 * (acceptAllAction) exists only by Andreas's explicit request — it carries
 * its own confirmation step and excludes anything the publish guard would
 * reject, so it cannot be an accident.
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
 * The report shown after an Accept-all run. Serializable by construction —
 * it travels back to the client component through useActionState.
 */
export interface AcceptAllResult {
  ok: boolean;
  positionsPublished: number;
  positionsSkipped: number;
  responsesPublished: number;
  error: string | null;
}

const EMPTY_ACCEPT_ALL: AcceptAllResult = {
  ok: false,
  positionsPublished: 0,
  positionsSkipped: 0,
  responsesPublished: 0,
  error: null,
};

/**
 * Publish EVERYTHING currently in_review — the whole positions queue plus
 * any waiting candidate responses.
 *
 * Added at Andreas's explicit request (Oct 18, 2026): ~3,700 staged rows
 * cannot be reviewed one click at a time. Two deliberate safeguards keep
 * this from being a careless button:
 *
 * 1. The UI asks for confirmation showing the live count before running.
 * 2. The publish guard is enforced, not bypassed. The database's
 *    published_needs_source CHECK constraint would reject the entire batch
 *    if a single row lacked a quote + source (or the no-public-position
 *    flag), so rows that would violate it are EXCLUDED up front and
 *    reported as skipped — the same spirit as the single-row approve,
 *    which lets the constraint reject it one at a time.
 *
 * Scale: the queue read is paged in 1,000-row ranges (PostgREST caps a
 * single response), and the writes are chunked set-based UPDATEs of 500
 * ids at a time — never a client-side loop over row objects, and no
 * reliance on the read cap for the write path. reviewed_by/reviewed_at
 * are set exactly as the single-row approve does; confidence, extents and
 * summary text are left as imported.
 */
export async function acceptAllAction(
  _prev: AcceptAllResult,
  _formData: FormData
): Promise<AcceptAllResult> {
  await requireAdmin();
  const db = getServiceClient();
  const now = new Date().toISOString();
  const READ_PAGE = 1000;
  const WRITE_CHUNK = 500;

  // Read the whole in_review queue, paged — the same pagination the page
  // itself uses since the 1,000-row cap fix.
  type QueueRow = {
    id: string;
    no_public_position: boolean | null;
    source_url: string | null;
    verbatim_quote: string | null;
  };
  const rows: QueueRow[] = [];
  for (let from = 0; ; from += READ_PAGE) {
    const { data, error } = await db
      .from("positions")
      .select("id,no_public_position,source_url,verbatim_quote")
      .eq("status", "in_review")
      .order("id", { ascending: true })
      .range(from, from + READ_PAGE - 1);
    if (error) throw new Error(`Could not read the queue: ${error.message}`);
    rows.push(...((data ?? []) as QueueRow[]));
    if (!data || data.length < READ_PAGE) break;
  }

  // Mirror the published_needs_source CHECK constraint: publishable means
  // no_public_position is set, or a quote AND a source URL are both
  // present. Anything else stays in review and is reported.
  const eligible = rows.filter(
    (r) => r.no_public_position || (r.source_url && r.verbatim_quote)
  );
  const skipped = rows.length - eligible.length;

  for (let i = 0; i < eligible.length; i += WRITE_CHUNK) {
    const chunk = eligible.slice(i, i + WRITE_CHUNK).map((r) => r.id);
    const { error } = await db
      .from("positions")
      .update({
        status: "published",
        reviewed_by: REVIEWER,
        reviewed_at: now,
      })
      .in("id", chunk);
    if (error)
      throw new Error(
        `Published ${i} of ${eligible.length} positions before failing: ${error.message}`
      );
  }

  // Candidate responses publish verbatim and carry no source guard — the
  // per-candidate bulk approve publishes them alongside positions, and
  // Accept-all does the same so it can't publish only half of what's
  // waiting.
  const respIds: string[] = [];
  for (let from = 0; ; from += READ_PAGE) {
    const { data, error } = await db
      .from("candidate_responses")
      .select("id")
      .eq("status", "in_review")
      .order("id", { ascending: true })
      .range(from, from + READ_PAGE - 1);
    if (error)
      throw new Error(`Could not read the responses queue: ${error.message}`);
    respIds.push(...((data ?? []) as { id: string }[]).map((r) => r.id));
    if (!data || data.length < READ_PAGE) break;
  }
  for (let i = 0; i < respIds.length; i += WRITE_CHUNK) {
    const chunk = respIds.slice(i, i + WRITE_CHUNK);
    const { error } = await db
      .from("candidate_responses")
      .update({
        status: "published",
        reviewed_by: REVIEWER,
        reviewed_at: now,
      })
      .in("id", chunk);
    if (error)
      throw new Error(
        `Published ${eligible.length} positions and ${i} responses before failing: ${error.message}`
      );
  }

  revalidatePath("/admin");
  revalidatePath("/races", "layout");

  return {
    ok: true,
    positionsPublished: eligible.length,
    positionsSkipped: skipped,
    responsesPublished: respIds.length,
    error: null,
  };
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

  await resolveCorrection(id, status, note);
}

/**
 * Per-button actions for the corrections form. The old design read the
 * decision from the clicked button's name/value pair
 * (formData.get("status")), which arrives as null whenever the form is
 * submitted without a submitter — and then threw
 * "Unexpected status: null" (Digest 4158835799, Oct 24) even though the
 * admin was signed in. Binding the decision into the action itself
 * makes a button click carry its decision no matter how the browser
 * submits the form.
 */
export async function acceptCorrectionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("resolution_note") ?? "").trim();
  await resolveCorrection(id, "accepted", note);
}

export async function rejectCorrectionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("resolution_note") ?? "").trim();
  await resolveCorrection(id, "rejected", note);
}

export async function requestCorrectionInfoAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const note = String(formData.get("resolution_note") ?? "").trim();
  await resolveCorrection(id, "needs_info", note);
}

async function resolveCorrection(
  id: string,
  status: string,
  note: string,
) {
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

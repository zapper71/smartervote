import { createHash, randomBytes } from "crypto";
import type { SourceExtent } from "./types";

/**
 * Shared helpers for the candidate input page and the /admin/submissions
 * queue. Kept out of the route files so the form's validation and the
 * Approve action's validation cannot drift apart: a row the form
 * accepts must be a row Approve accepts, and vice versa.
 */

export type SubmissionStatus =
  | "pending_confirmation"
  | "new"
  | "approved"
  | "rejected";

export interface SubmissionPositionInput {
  issue_slug: string;
  summary_short: string;
  summary_bullets: string[];
  verbatim_quote: string;
}

export interface CandidateSubmission {
  id: string;
  candidate_id: string;
  contact_email: string;
  public_email: string | null;
  bio: string | null;
  website: string | null;
  socials: Record<string, string>;
  positions: SubmissionPositionInput[];
  status: SubmissionStatus;
  confirmation_token_hash: string | null;
  confirmation_expires_at: string | null;
  confirmation_sent_at: string | null;
  confirmed_at: string | null;
  manual_verification: boolean;
  notification_status: "pending" | "drafted";
  notification_draft_ref: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  skipped_positions: { issue_slug: string; reason: string }[];
}

/** Confirmation links live for 30 days. */
export const CONFIRMATION_TOKEN_TTL_DAYS = 30;

/** A fresh raw confirmation token (goes in the email link only). */
export function newConfirmationToken(): string {
  return randomBytes(32).toString("hex");
}

/** What is stored: the SHA-256 of the token, never the token itself. */
export function hashConfirmationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * The length bucket for a candidate-controlled source, from the quote
 * itself — the same SIZE_EXTENTS vocabulary the import path uses
 * (allowedExtents("candidate_submission")). One sentence, a few
 * sentences, or several paragraphs; a single quote never reaches
 * "a page or more".
 */
export function extentForQuote(quote: string): SourceExtent {
  const sentences = quote
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  if (sentences <= 1) return "one sentence";
  if (sentences <= 5) return "a few sentences";
  return "several paragraphs";
}

/**
 * Validate position rows against the race's issue list. Returns the
 * rows worth keeping plus every problem, so callers can refuse the
 * whole submission (Approve) or report skips (submit) without
 * inventing a second rule set.
 *
 * Rules: slug must be in the race's approved set; a row with a summary
 * but no quote is refused (a position without the candidate's words
 * is a characterisation, not a submission); summaries stay within
 * the 140-char display limit.
 */
export function validateSubmissionPositions(
  positions: unknown,
  allowedSlugs: Set<string>
): { rows: SubmissionPositionInput[]; errors: string[] } {
  const rows: SubmissionPositionInput[] = [];
  const errors: string[] = [];
  if (!Array.isArray(positions)) {
    return { rows, errors: ["Positions must be a list."] };
  }
  for (const raw of positions) {
    const p = raw as Partial<SubmissionPositionInput>;
    const slug = typeof p.issue_slug === "string" ? p.issue_slug : "";
    if (!allowedSlugs.has(slug)) {
      errors.push(`"${slug}" is not an issue for this race — skipping it.`);
      continue;
    }
    const summary =
      typeof p.summary_short === "string" ? p.summary_short.trim() : "";
    const quote =
      typeof p.verbatim_quote === "string" ? p.verbatim_quote.trim() : "";
    const bullets = Array.isArray(p.summary_bullets)
      ? (p.summary_bullets as unknown[]).map((b) => String(b).trim()).filter(Boolean)
      : [];
    if (!summary && !quote && bullets.length === 0) continue; // untouched block
    if (summary.length > 140) {
      errors.push(
        `The summary for "${slug}" is ${summary.length} characters — the limit is 140.`
      );
      continue;
    }
    if (!quote) {
      errors.push(
        `The "${slug}" position has a summary but no quote — a position needs the candidate's own words.`
      );
      continue;
    }
    rows.push({ issue_slug: slug, summary_short: summary, summary_bullets: bullets, verbatim_quote: quote });
  }
  return { rows, errors };
}

/** Exact-duplicate test: same issue, same quote, same summary. */
export function isDuplicatePosition(
  row: SubmissionPositionInput,
  existing: { issue_slug: string; verbatim_quote: string; summary_short: string }[]
): boolean {
  return existing.some(
    (e) =>
      e.issue_slug === row.issue_slug &&
      e.verbatim_quote.trim() === row.verbatim_quote.trim() &&
      e.summary_short.trim() === row.summary_short.trim()
  );
}

/**
 * Assemble the full-text reply (candidate_responses.body_text) from the
 * approved position rows, with one section per issue. Headings are the
 * issue names as exact lines, so CandidateResponse can deep-link to
 * them; anchors follow the stored convention
 * resp-<candidate-slug>-<issue-slug>.
 */
export function assembleResponseBody(
  candidateSlug: string,
  rows: SubmissionPositionInput[],
  issueNameBySlug: Record<string, string>
): { body_text: string; sections: { heading: string; anchor: string; issue_slug: string }[] } {
  const sections = rows.map((r) => ({
    heading: issueNameBySlug[r.issue_slug] ?? r.issue_slug,
    anchor: `resp-${candidateSlug}-${r.issue_slug}`,
    issue_slug: r.issue_slug,
  }));
  const body_text = rows
    .map((r, i) => {
      const parts = [sections[i].heading, "", r.summary_short];
      if (r.summary_bullets.length > 0) {
        parts.push("", ...r.summary_bullets.map((b) => `- ${b}`));
      }
      parts.push("", `"${r.verbatim_quote}"`);
      return parts.join("\n");
    })
    .join("\n\n");
  return { body_text, sections };
}

/** Very small email shape check — the roster match is the signal, not this. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

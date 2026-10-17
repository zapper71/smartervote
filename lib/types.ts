// Shapes returned by the database. Kept hand-written rather than generated
// so they stay readable — the schema is small and changes rarely.

export type RaceType =
  | "mayor"
  | "council_at_large"
  | "council_ward"
  | "school_board"
  | "provincial_district";

export type CandidateStatus = "certified" | "withdrawn" | "acclaimed";

/**
 * The controlled vocabulary for Position.source_extent. Must match the
 * positions_source_extent_check constraint in 11_source_extent.sql.
 *
 * The first four are sizes. The last two deliberately are not — see the
 * comment on Position.source_extent.
 */
export type SourceExtent =
  | "one sentence"
  | "a few sentences"
  | "several paragraphs"
  | "a page or more"
  | "reported remarks"
  | "remarks at a public meeting";

/** Lengths. Only valid where the CANDIDATE chose how much to write. */
export const SIZE_EXTENTS = [
  "one sentence",
  "a few sentences",
  "several paragraphs",
  "a page or more",
] as const satisfies readonly SourceExtent[];

/** Not lengths. For sources where someone else decided the length. */
export const REPORTED_EXTENTS = [
  "reported remarks",
  "remarks at a public meeting",
] as const satisfies readonly SourceExtent[];

/**
 * Which extents may be used for a given source.
 *
 * This is the fairness rule in code: a candidate quoted in a newspaper never
 * gets a length, because the reporter chose it. Labelling them "one sentence"
 * would punish them for an editorial decision they had no part in — and it
 * would land hardest on the candidates with no website, who are the ones who
 * most need the local paper to speak for them.
 *
 * Enforced in three places on purpose: here for the dropdown, again in the
 * server action, and finally by positions_source_extent_check in the
 * database. The UI can be bypassed; the constraint cannot.
 */
export function allowedExtents(
  sourceType: SourceType | null | undefined
): readonly SourceExtent[] {
  return sourceType === "local_news" || sourceType === "all_candidates_meeting"
    ? REPORTED_EXTENTS
    : SIZE_EXTENTS;
}

export type SourceType =
  | "candidate_website"
  | "candidate_social"
  | "local_news"
  | "all_candidates_meeting"
  | "candidate_submission"
  | "candidate_questionnaire";

/**
 * How much we trust that a position is really the candidate's.
 *
 * This is NOT a quality rating and NOT the length of the source (see
 * migration 11 for why length never gets a scale). It answers one
 * question: do we know these are really their words?
 *
 *   high   A quote found at an approved source, or the candidate's own
 *          feedback on the position.
 *   medium Claimed by someone who said they were the candidate via the
 *          site, but not yet verified. The default when uncertain.
 *   low    Submitted by someone else, with no corroboration found.
 *
 * Enforced in the database by positions_confidence_check.
 */
export type Confidence = "low" | "medium" | "high";

export const CONFIDENCE_LEVELS: readonly Confidence[] = [
  "low",
  "medium",
  "high",
];

/**
 * The confidence newly staged content starts with, from its source type.
 *
 * Quotes found at an approved source (or the candidate's own reply) enter
 * as 'high'. Everything else — i.e. site submissions not yet verified —
 * enters at 'medium', the default when uncertain, for Andreas to review.
 * Mirrors the backfill in migration 22.
 */
export function confidenceForSourceType(
  sourceType: SourceType | null | undefined
): Confidence {
  switch (sourceType) {
    case "candidate_website":
    case "candidate_social":
    case "local_news":
    case "all_candidates_meeting":
    case "candidate_questionnaire":
    case "candidate_submission":
      return "high";
    default:
      return "medium";
  }
}

/**
 * Normalise a confidence value read from the database.
 *
 * The column is new: rows read through a view that does not expose it yet
 * (or written before the migration ran) come back without it. Missing or
 * unrecognised values resolve to 'medium' — the default when uncertain —
 * and never crash the render.
 */
export function resolveConfidence(v: unknown): Confidence {
  return v === "low" || v === "medium" || v === "high" ? v : "medium";
}

export interface Municipality {
  id: string;
  name: string;
  slug: string;
  province: string;
  upper_tier: string | null;
  election_date: string | null;
  advance_voting_opens: string | null;
  voting_method: string | null;
  official_url: string | null;
  coverage_status: "live" | "partial" | "none";
}

export interface Race {
  id: string;
  municipality_id: string;
  name: string;
  slug: string;
  race_type: RaceType;
  seats: number;
  ward_group_label: string | null;
  description: string | null;
  is_acclaimed: boolean;
  sort_order: number;
  /**
   * The language this race is conducted in.
   *
   * 'fr' for the Conseil scolaire catholique MonAvenir trustee seat, whose
   * electors are French-language rights holders. 'en' for everything else.
   *
   * RECORDED, NOT RENDERED. The site is English throughout: this community is
   * predominantly anglophone, Ontario francophones are overwhelmingly
   * bilingual, and a French mirror that one unpaid person cannot keep current
   * would say "afterthought" more loudly than an English page does. The
   * column stays because it is a true fact about the race and costs nothing,
   * and because if that decision is ever revisited this is where it starts.
   */
  language: "en" | "fr";
}

export interface Ward {
  id: string;
  number: number | null;
  name: string;
  race_id: string | null;
}

/**
 * The Town's free-text social media field, exactly as published.
 *
 * These are HANDLES AND PAGE NAMES, NOT URLs. Do not construct a URL from
 * them. See components/WebsiteLink.tsx for why — a constructed link once
 * pointed a candidate's name at a stranger in South Carolina.
 */
export interface Socials {
  facebook?: string;
  instagram?: string;
  x?: string;
  [key: string]: string | undefined;
}

/**
 * A social media URL a HUMAN has opened and confirmed belongs to this
 * candidate. Only these are ever rendered as links.
 */
export interface VerifiedLink {
  platform: string;
  label: string;
  url: string;
  verified_at: string;
  verified_by: string;
}

export interface Candidate {
  id: string;
  race_id: string;
  name: string;
  slug: string;
  status: CandidateStatus;
  /** Published as a URL by the Town on the certified candidate list. Safe to link. */
  website: string | null;
  /** Free text from the Town. NEVER linked — see Socials above. */
  socials: Socials;
  /** Human-verified social URLs. The only social links the site renders. */
  verified_links: VerifiedLink[];
  photo_url: string | null;
  bio: string | null;
  incumbent: boolean;
  last_reviewed_at: string | null;
  /**
   * Party affiliation, for provincial district races (BC).
   *
   * Optional, not absent-by-design: the column is new (migration 24), so
   * rows read before it runs come back without it. Consumers must treat a
   * missing value as "unknown" and never crash the render — same pattern
   * as Position.confidence.
   */
  party?: string | null;
  /**
   * When we emailed this candidate inviting them to correct or add.
   *
   * null means we have not asked — and while it is null the site must not
   * word an empty page in a way that implies the candidate chose silence.
   */
  contacted_at: string | null;
  /** When they replied, if they did. */
  responded_at: string | null;
  race_slug?: string;
  race_name?: string;
  race_type?: RaceType;
  seats?: number;
}

export interface Issue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  voter_question: string | null;
  sort_order: number;
  /**
   * Which kind of race this issue belongs to.
   *
   * School board trustees do not set property taxes, fix roads or sit at the
   * District table. Showing a trustee candidate twelve municipal issues and
   * marking all twelve "no public statement found" is not neutral reporting —
   * it is a made-up scorecard for a job they are not running for.
   */
  applies_to: "municipal" | "school_board";
}

export interface Position {
  id: string;
  candidate_id: string;
  issue_id: string;
  summary_short: string | null;
  summary_bullets: string[] | null;
  verbatim_quote: string | null;
  source_url: string | null;
  source_title: string | null;
  source_type: SourceType | null;
  source_date: string | null;
  no_public_position: boolean;
  /**
   * True on EVERY row of a set where the candidate has said materially
   * different things on the same issue. Both statements get shown; the site
   * doesn't choose between them.
   */
  is_conflicting: boolean;
  /**
   * How much the candidate published on this issue AT THE SOURCE.
   *
   * NOT a quality rating and NOT the length of our quote. It exists so the
   * comparison grid can distinguish a dedicated platform page from a single
   * clause in a list, without scoring anyone.
   *
   * Sizes are only ever used where the candidate chose the length — their
   * own website. A journalist's article or a public meeting gets "reported
   * remarks" instead, with no size, because there the length was somebody
   * else's editorial decision and blaming the candidate for it would
   * penalise exactly the candidates who have no website.
   *
   * null means we haven't recorded it, and the UI shows nothing.
   */
  source_extent: SourceExtent | null;
  reviewed_at: string | null;
  /**
   * Optional, not absent-by-design: the confidence column is new, so rows
   * read before the migration runs (or through an older view) have no
   * value. Consumers must use resolveConfidence() and treat missing as
   * 'medium' — the default when uncertain — rather than assuming it.
   */
  confidence?: Confidence | null;
  issue_name: string;
  issue_slug: string;
  issue_sort: number;
}

/**
 * One section of a candidate's email reply, for deep links.
 *
 * Stored in candidate_responses.sections. `heading` is an exact line from
 * the reply's body text; `anchor` is resp-<candidate-slug>-<slugified
 * heading> and must match what the migration generated. `issue_slug` is
 * null for sections that restate rather than answer (e.g. campaign
 * slogans) — they appear in the full reply but get no comparison cell.
 */
export interface ResponseSection {
  heading: string;
  anchor: string;
  issue_slug: string | null;
}

/**
 * A candidate's full, unedited reply to the review email.
 *
 * Read from public_candidate_responses (published only). The parsed
 * per-issue summaries live in positions with
 * source_type = 'candidate_submission'; this is the complete text behind
 * them, shown in the "What [Name] told us" expander.
 */
export interface CandidateResponse {
  id: string;
  candidate_id: string;
  received_at: string;
  subject: string | null;
  body_text: string;
  sections: ResponseSection[];
}

/** A race with its candidates attached. */
export interface RaceWithCandidates extends Race {
  candidates: Candidate[];
}

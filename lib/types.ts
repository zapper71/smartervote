// Shapes returned by the database. Kept hand-written rather than generated
// so they stay readable — the schema is small and changes rarely.

export type RaceType =
  | "mayor"
  | "council_at_large"
  | "council_ward"
  | "school_board";

export type CandidateStatus = "certified" | "withdrawn" | "acclaimed";

export type SourceType =
  | "candidate_website"
  | "candidate_social"
  | "local_news"
  | "all_candidates_meeting"
  | "candidate_submission";

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
}

export interface Ward {
  id: string;
  number: number | null;
  name: string;
  race_id: string | null;
}

export interface Socials {
  facebook?: string;
  instagram?: string;
  x?: string;
  [key: string]: string | undefined;
}

export interface Candidate {
  id: string;
  race_id: string;
  name: string;
  slug: string;
  status: CandidateStatus;
  website: string | null;
  socials: Socials;
  photo_url: string | null;
  bio: string | null;
  incumbent: boolean;
  last_reviewed_at: string | null;
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
  reviewed_at: string | null;
  issue_name: string;
  issue_slug: string;
  issue_sort: number;
}

/** A race with its candidates attached. */
export interface RaceWithCandidates extends Race {
  candidates: Candidate[];
}

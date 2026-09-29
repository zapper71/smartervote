import { getPublicClient } from "./supabase";
import type {
  Candidate,
  CandidateResponse,
  Issue,
  Municipality,
  Position,
  Race,
  RaceType,
  RaceWithCandidates,
  Ward,
} from "./types";


export const MUNICIPALITY_SLUG = "huntsville";

/**
 * Every function here returns empty/null rather than throwing when the
 * database is unreachable or unconfigured.
 *
 * That is deliberate. A build must not fail because of a transient database
 * blip, and a page must not 500 in front of a voter during advance voting.
 * Pages render an honest "information unavailable" state instead.
 */

function warn(where: string, error: unknown) {
  // eslint-disable-next-line no-console
  console.warn(`[smartervote] ${where}:`, error);
}

export async function getMunicipality(): Promise<Municipality | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("municipalities")
    .select("*")
    .eq("slug", MUNICIPALITY_SLUG)
    .maybeSingle();
  if (error) {
    warn("getMunicipality", error);
    return null;
  }
  return (data as Municipality) ?? null;
}

export async function getRaces(): Promise<Race[]> {
  const db = getPublicClient();
  if (!db) return [];
  const municipality = await getMunicipality();
  if (!municipality) return [];
  const { data, error } = await db
    .from("races")
    .select("*")
    .eq("municipality_id", municipality.id)
    .order("sort_order", { ascending: true });
  if (error) {
    warn("getRaces", error);
    return [];
  }
  return (data as Race[]) ?? [];
}

export async function getRace(slug: string): Promise<Race | null> {
  const races = await getRaces();
  return races.find((r) => r.slug === slug) ?? null;
}

export async function getCandidatesForRace(raceId: string): Promise<Candidate[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("candidates")
    .select("*")
    .eq("race_id", raceId)
    .neq("status", "withdrawn")
    .order("name", { ascending: true });
  if (error) {
    warn("getCandidatesForRace", error);
    return [];
  }
  return (data as Candidate[]) ?? [];
}

export async function getRacesWithCandidates(): Promise<RaceWithCandidates[]> {
  const races = await getRaces();
  if (races.length === 0) return [];
  const db = getPublicClient();
  if (!db) return races.map((r) => ({ ...r, candidates: [] }));

  const { data, error } = await db
    .from("candidates")
    .select("*")
    .neq("status", "withdrawn")
    .in(
      "race_id",
      races.map((r) => r.id)
    )
    .order("name", { ascending: true });

  if (error) {
    warn("getRacesWithCandidates", error);
    return races.map((r) => ({ ...r, candidates: [] }));
  }

  const all = (data as Candidate[]) ?? [];
  return races.map((r) => ({
    ...r,
    candidates: all.filter((c) => c.race_id === r.id),
  }));
}

export async function getCandidate(
  raceSlug: string,
  candidateSlug: string
): Promise<{ race: Race; candidate: Candidate } | null> {
  const race = await getRace(raceSlug);
  if (!race) return null;
  const candidates = await getCandidatesForRace(race.id);
  const candidate = candidates.find((c) => c.slug === candidateSlug);
  if (!candidate) return null;
  return { race, candidate };
}

export async function getWards(): Promise<Ward[]> {
  const db = getPublicClient();
  if (!db) return [];
  const municipality = await getMunicipality();
  if (!municipality) return [];
  const { data, error } = await db
    .from("wards")
    .select("id, number, name, race_id")
    .eq("municipality_id", municipality.id)
    .order("number", { ascending: true });
  if (error) {
    warn("getWards", error);
    return [];
  }
  return (data as Ward[]) ?? [];
}

/** Published positions for one candidate, in issue order. */
export async function getPositions(candidateId: string): Promise<Position[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("public_positions")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("issue_sort", { ascending: true });
  if (error) {
    warn("getPositions", error);
    return [];
  }
  return (data as Position[]) ?? [];
}

/**
 * The issues for one kind of race, in display order.
 *
 * WHY THIS TAKES A RACE TYPE. Every candidate in a race is measured against
 * the same list, or comparison means nothing — but a school board trustee and
 * a mayor are not in the same race. Trustees do not set the municipal levy,
 * repair roads, or sit at the District table. Listing those against a
 * trustee's name and marking each one "no public statement found" invents a
 * scorecard for a job they never stood for, and it would make the least
 * covered candidates on the site look the most evasive.
 *
 * Pass the race's type. Omit it and you get the municipal set, which is the
 * safe default for anything that isn't a school board seat.
 */
export async function getIssues(raceType?: RaceType): Promise<Issue[]> {
  const db = getPublicClient();
  if (!db) return [];
  const municipality = await getMunicipality();
  if (!municipality) return [];
  const appliesTo = raceType === "school_board" ? "school_board" : "municipal";
  const { data, error } = await db
    .from("issues")
    .select("*")
    .eq("municipality_id", municipality.id)
    .eq("applies_to", appliesTo)
    .order("sort_order", { ascending: true });
  if (error) {
    warn("getIssues", error);
    return [];
  }
  return (data as Issue[]) ?? [];
}

/**
 * Every published position for every candidate in one race.
 *
 * One query rather than N, because the comparison page needs the whole grid
 * and doing it per-candidate would mean six round trips to render one table.
 */
export async function getPositionsForCandidates(
  candidateIds: string[]
): Promise<Position[]> {
  if (candidateIds.length === 0) return [];
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("public_positions")
    .select("*")
    .in("candidate_id", candidateIds)
    .order("issue_sort", { ascending: true });
  if (error) {
    warn("getPositionsForCandidates", error);
    return [];
  }
  return (data as Position[]) ?? [];
}
/**
 * A candidate's full email reply, if they've sent one and it's published.
 *
 * Null is the normal case — most candidates haven't replied. Callers
 * render nothing when it comes back null.
 */
export async function getCandidateResponse(
  candidateId: string
): Promise<CandidateResponse | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("public_candidate_responses")
    .select("*")
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (error) {
    warn("getCandidateResponse", error);
    return null;
  }
  return (data as CandidateResponse) ?? null;
}

/**
 * Published email replies for a set of candidates, in one query.
 *
 * The comparison page needs every candidate's reply to build the
 * "Read their full response" deep links; one round trip, not N.
 */
export async function getCandidateResponsesForCandidates(
  candidateIds: string[]
): Promise<CandidateResponse[]> {
  if (candidateIds.length === 0) return [];
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("public_candidate_responses")
    .select("*")
    .in("candidate_id", candidateIds);
  if (error) {
    warn("getCandidateResponsesForCandidates", error);
    return [];
  }
  return (data as CandidateResponse[]) ?? [];
}

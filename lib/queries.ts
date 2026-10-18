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

export async function getMunicipalityBySlug(
  slug: string
): Promise<Municipality | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("municipalities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    warn("getMunicipalityBySlug", error);
    return null;
  }
  return (data as Municipality) ?? null;
}

export async function getMunicipalityById(
  id: string
): Promise<Municipality | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("municipalities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    warn("getMunicipalityById", error);
    return null;
  }
  return (data as Municipality) ?? null;
}

export async function getMunicipality(): Promise<Municipality | null> {
  return getMunicipalityBySlug(MUNICIPALITY_SLUG);
}

/**
 * Huntsville's races, in display order.
 *
 * Stays Huntsville-scoped on purpose: the /races index, the sitemap and the
 * build-time static params are the Huntsville site, and expansion races
 * render on demand once their database rows exist.
 */
export async function getRaces(): Promise<Race[]> {
  const municipality = await getMunicipality();
  if (!municipality) return [];
  return getRacesForMunicipality(municipality.id);
}

export async function getRacesForMunicipality(
  municipalityId: string
): Promise<Race[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("races")
    .select("*")
    .eq("municipality_id", municipalityId)
    .order("sort_order", { ascending: true });
  if (error) {
    warn("getRacesForMunicipality", error);
    return [];
  }
  return (data as Race[]) ?? [];
}

/**
 * A race by slug, looked up GLOBALLY — across all municipalities — with its
 * municipality attached.
 *
 * Race slugs are globally unique by construction (new slugs are
 * "{municipality-slug}-{race}"; Huntsville keeps its existing unprefixed
 * ones), so a slug identifies one race everywhere. Pages use the returned
 * municipality for the name, election dates and voting method instead of
 * assuming Huntsville.
 */
export async function getRaceBySlugGlobal(
  slug: string
): Promise<{ race: Race; municipality: Municipality | null } | null> {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("races")
    .select("*, municipalities(*)")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) {
    warn("getRaceBySlugGlobal", error);
    return null;
  }
  if (!data) return null;
  const { municipalities: municipality, ...race } = data as Race & {
    municipalities: Municipality | null;
  };
  return { race: race as Race, municipality };
}

export async function getRace(slug: string): Promise<Race | null> {
  const found = await getRaceBySlugGlobal(slug);
  return found?.race ?? null;
}

export async function getCandidatesForRace(raceId: string): Promise<Candidate[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("candidates")
    .select("*")
    .eq("race_id", raceId)
    // Withdrawn candidates are NOT filtered here: they stay on the printed
    // ballot, so they render with the grey Withdrawn pill + strikethrough.
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
    // Withdrawn candidates included — see note above (Withdrawn pill).
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
 * safe default for anything that isn't a school board seat — including
 * provincial districts, which have no school-board-style split.
 *
 * Pass the race's municipality id. Omit it and you get Huntsville's, which
 * keeps every existing caller working exactly as before.
 */
export async function getIssues(
  raceType?: RaceType,
  municipalityId?: string
): Promise<Issue[]> {
  const db = getPublicClient();
  if (!db) return [];
  let muniId = municipalityId;
  if (!muniId) {
    const municipality = await getMunicipality();
    if (!municipality) return [];
    muniId = municipality.id;
  }
  const appliesTo = raceType === "school_board" ? "school_board" : "municipal";
  const { data, error } = await db
    .from("issues")
    .select("*")
    .eq("municipality_id", muniId)
    .eq("applies_to", appliesTo)
    .order("sort_order", { ascending: true });
  if (error) {
    warn("getIssues", error);
    return [];
  }
  return (data as Issue[]) ?? [];
}

/**
 * Which of these race slugs have at least one PUBLISHED position.
 *
 * Used by the municipality pages to tag races "positions loaded" vs
 * "candidate list only" — and to decide where a compare link is honest.
 * This queries public_positions through candidates -> race, so it reflects
 * real published data rather than mere race rows. Returns null (not an
 * empty set) when the check itself fails, so callers can render WITHOUT
 * the tags rather than mislabelling everything as pending.
 */
export async function getRaceSlugsWithPublishedPositions(
  slugs: string[]
): Promise<Set<string> | null> {
  if (slugs.length === 0) return new Set();
  const db = getPublicClient();
  if (!db) return null;
  try {
    const { data: raceRows, error: racesError } = await db
      .from("races")
      .select("id, slug")
      .in("slug", slugs);
    if (racesError) {
      warn("getRaceSlugsWithPublishedPositions", racesError);
      return null;
    }
    const idToSlug = new Map(
      ((raceRows ?? []) as { id: string; slug: string }[]).map((r) => [
        r.id,
        r.slug,
      ])
    );
    if (idToSlug.size === 0) return new Set();
    const { data: candidateRows, error: candidatesError } = await db
      .from("candidates")
      .select("id, race_id")
      .in("race_id", [...idToSlug.keys()]);
    // Withdrawn candidates included — a withdrawn candidate's published
    // positions count toward the race's "positions loaded" badge.
    if (candidatesError) {
      warn("getRaceSlugsWithPublishedPositions", candidatesError);
      return null;
    }
    const candidateIdToSlug = new Map(
      ((candidateRows ?? []) as { id: string; race_id: string }[]).map((c) => [
        c.id,
        idToSlug.get(c.race_id) as string,
      ])
    );
    if (candidateIdToSlug.size === 0) return new Set();
    const { data: positionRows, error: positionsError } = await db
      .from("public_positions")
      .select("candidate_id")
      .in("candidate_id", [...candidateIdToSlug.keys()])
      .limit(100000);
    if (positionsError) {
      warn("getRaceSlugsWithPublishedPositions", positionsError);
      return null;
    }
    const out = new Set<string>();
    for (const p of (positionRows ?? []) as { candidate_id: string }[]) {
      const slug = candidateIdToSlug.get(p.candidate_id);
      if (slug) out.add(slug);
    }
    return out;
  } catch (e) {
    warn("getRaceSlugsWithPublishedPositions", e);
    return null;
  }
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

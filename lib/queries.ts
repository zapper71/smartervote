import { getPublicClient } from "./supabase";
import type {
  Candidate,
  Municipality,
  Position,
  Race,
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

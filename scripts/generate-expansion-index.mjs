#!/usr/bin/env node
/**
 * Generate the static expansion index for the SmarterVote preview.
 *
 * Reads:
 *   ~/workspace/goals/smartervote-national-scale-up-planning/files/expansion/ontario-names-races.json
 *   ~/workspace/goals/smartervote-national-scale-up-planning/files/bc-2026-candidates.json
 * Emits:
 *   lib/expansion-index.ts    (full index — server components only)
 *   lib/expansion-finder.ts   (lightweight finder lists — safe for the client bundle)
 *
 * This index powers navigation on the Vercel preview WITHOUT needing the
 * database rows (migrations 24–28) to exist yet. It is a LISTINGS tier:
 * candidate names and race structure only, no positions. Anything that
 * needs positions still reads the database and degrades honestly when the
 * rows aren't there.
 *
 * SLUG SCHEME — must stay in sync with the DATA agent's migrations:
 *   slugify(s): lowercase; runs of non-[a-z0-9] -> single hyphen; strip edge hyphens.
 *   municipality slug = slugify(name)
 *   race slug = "{municipality-slug}-{slugify(race label)}"  (globally unique)
 *   candidate slug = "{municipality-slug}-{slugify(name)}"
 * Huntsville keeps its existing unprefixed slugs, so it is NOT in
 * RACES_BY_MUNICIPALITY — its races are database-driven and live under
 * /races/*. It IS in MUNICIPALITIES (synthetic entry, counts unknown until
 * the database is read) so the homepage finder surfaces it.
 *
 * Run: node scripts/generate-expansion-index.mjs
 * No dependencies.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const filesDir = join(
  process.env.HOME,
  "workspace/goals/smartervote-national-scale-up-planning/files"
);

/** The slug scheme shared with the DATA agent. Keep in sync. */
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function classifyOntarioRaceType(label) {
  const l = label.toLowerCase();
  if (/school board|trustee|cecce|cepeo|cdsbeo|conseil scolaire/.test(l))
    return "school_board";
  if (/^\s*mayor\b/.test(l)) return "mayor"; // "Mayor", not "Deputy Mayor"
  if (/\bward\b/.test(l)) return "council_ward";
  return "council_at_large";
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function tsString(s) {
  return JSON.stringify(s);
}

// ---------------------------------------------------------------- Ontario
const ontarioRows = loadJson(join(filesDir, "expansion/ontario-names-races.json"));

// municipality -> race label -> { candidates: [], sources: Set }
const ontario = new Map();
for (const row of ontarioRows) {
  const muniName = String(row.municipality ?? "").trim();
  const raceLabel = String(row.race ?? "").trim();
  const candName = String(row.candidate ?? "").trim();
  if (!muniName || !raceLabel || !candName) continue;
  if (!ontario.has(muniName))
    ontario.set(muniName, { races: new Map() });
  const muni = ontario.get(muniName);
  if (!muni.races.has(raceLabel))
    muni.races.set(raceLabel, { candidates: new Map(), sources: new Set() });
  const race = muni.races.get(raceLabel);
  if (!race.candidates.has(candName)) {
    race.candidates.set(candName, {
      name: candName,
      acclaimed:
        row.acclaimed === true ? true : row.acclaimed === false ? false : null,
    });
  }
  if (row.source_url) race.sources.add(String(row.source_url));
}

// --------------------------------------------------------------------- BC
const bcDistricts = loadJson(join(filesDir, "bc-2026-candidates.json"));
const BC_SLUG = "british-columbia";
const BC_SOURCE = "https://www.elections.bc.ca";

// ------------------------------------------------------------ emit index
const municipalities = [];
const racesByMunicipality = {};

// Ontario: 265 municipalities, alphabetical by name.
for (const muniName of [...ontario.keys()].sort((a, b) => a.localeCompare(b))) {
  const muniSlug = slugify(muniName);
  const muni = ontario.get(muniName);
  const races = [];
  let candidateCount = 0;
  for (const raceLabel of [...muni.races.keys()].sort((a, b) =>
    a.localeCompare(b)
  )) {
    const r = muni.races.get(raceLabel);
    const raceType = classifyOntarioRaceType(raceLabel);
    const candidates = [...r.candidates.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    candidateCount += candidates.length;
    races.push({
      slug: `${muniSlug}-${slugify(raceLabel)}`,
      name: raceLabel,
      raceType,
      // Seats are not in the source data. Mayor is definitionally one seat;
      // everything else is unknown rather than guessed.
      seats: raceType === "mayor" ? 1 : null,
      candidates,
      sources: [...r.sources].sort(),
    });
  }
  municipalities.push({
    slug: muniSlug,
    name: muniName,
    province: "ON",
    raceCount: races.length,
    candidateCount,
  });
  racesByMunicipality[muniSlug] = races;
}

// BC: 93 districts as races under 'british-columbia'.
const bcRaces = [];
let bcCandidateCount = 0;
for (const d of bcDistricts) {
  const districtName = String(d.electoral_district ?? "").trim();
  if (!districtName) continue;
  const candidates = (d.candidates ?? [])
    .map((c) => ({
      name: String(c.name ?? "").trim(),
      acclaimed: null, // not in the source data; a null here means unknown, not "no"
      party: String(c.affiliation ?? "").trim() || undefined,
    }))
    .filter((c) => c.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  bcCandidateCount += candidates.length;
  bcRaces.push({
    slug: `${BC_SLUG}-${slugify(districtName)}`,
    name: districtName,
    raceType: "provincial_district",
    seats: 1, // each BC electoral district elects one MLA
    candidates,
    sources: [BC_SOURCE],
  });
}
bcRaces.sort((a, b) => a.name.localeCompare(b.name));
municipalities.push({
  slug: BC_SLUG,
  name: "British Columbia",
  province: "BC",
  raceCount: bcRaces.length,
  candidateCount: bcCandidateCount,
});
racesByMunicipality[BC_SLUG] = bcRaces;

// Huntsville: synthetic entry so the finder surfaces it. Its races keep
// their existing unprefixed slugs and are database-driven, so it has no
// RACES_BY_MUNICIPALITY entry — /municipalities/huntsville redirects to
// /races, the canonical Huntsville page.
municipalities.unshift({
  slug: "huntsville",
  name: "Huntsville",
  province: "ON",
  raceCount: null, // database-driven; unknown at generation time
  candidateCount: null,
});

const generatedAt = new Date().toISOString();
const header = `/**
 * GENERATED FILE — do not edit by hand.
 * Generated ${generatedAt} by scripts/generate-expansion-index.mjs
 * from the DATA agent's source files. Re-run the script to regenerate.
 *
 * LISTINGS TIER ONLY: candidate names and race structure, no positions.
 * Powers navigation on the preview before migrations 24–28 are run.
 * Slug scheme is shared with the DATA agent — see the script header.
 */
`;

const indexTs =
  header +
  `import type { RaceType } from "./types";

export interface ExpansionMunicipality {
  slug: string;
  name: string;
  province: "ON" | "BC";
  /** null when the count is database-driven and unknown at generation time (Huntsville). */
  raceCount: number | null;
  candidateCount: number | null;
}

export interface ExpansionCandidate {
  name: string;
  /** null = unknown (not yet researched), not "not acclaimed". */
  acclaimed: boolean | null;
  party?: string;
}

export interface ExpansionRace {
  slug: string;
  name: string;
  raceType: RaceType;
  /** null = not in the source data; shown as unknown, never guessed. */
  seats: number | null;
  candidates: ExpansionCandidate[];
  /** Where the candidate list came from. */
  sources: string[];
}

/** 265 Ontario municipalities + British Columbia (+ synthetic Huntsville first). */
export const MUNICIPALITIES: ExpansionMunicipality[] = ${JSON.stringify(
    municipalities,
    null,
    2
  )};

export const RACES_BY_MUNICIPALITY: Record<string, ExpansionRace[]> = ${JSON.stringify(
    racesByMunicipality,
    null,
    2
  )};
`;

const finderMunicipalities = municipalities
  .filter((m) => m.province === "ON")
  .map((m) => ({ slug: m.slug, name: m.name }));
const finderDistricts = bcRaces.map((r) => ({
  name: r.name,
  raceSlug: r.slug,
}));

const finderTs =
  header +
  `/**
 * Lightweight finder lists — the only expansion data shipped to the client
 * bundle. The full index (lib/expansion-index.ts) stays server-side.
 */
export interface FinderMunicipality {
  slug: string;
  name: string;
}

/** Ontario municipalities, Huntsville first, then alphabetical. */
export const FINDER_MUNICIPALITIES: FinderMunicipality[] = ${JSON.stringify(
    finderMunicipalities,
    null,
    2
  )};

export interface FinderDistrict {
  /** Display name of the electoral district. */
  name: string;
  /** Race slug — a BC district IS its race page, linked directly. */
  raceSlug: string;
}

/** The 93 BC electoral districts, alphabetical. */
export const FINDER_DISTRICTS: FinderDistrict[] = ${JSON.stringify(
    finderDistricts,
    null,
    2
  )};
`;

mkdirSync(join(repoRoot, "lib"), { recursive: true });
writeFileSync(join(repoRoot, "lib/expansion-index.ts"), indexTs);
writeFileSync(join(repoRoot, "lib/expansion-finder.ts"), finderTs);

console.log(
  `wrote lib/expansion-index.ts (${municipalities.length} municipalities, ` +
    `${Object.values(racesByMunicipality).reduce((n, r) => n + r.length, 0)} races)`
);
console.log(
  `wrote lib/expansion-finder.ts (${finderMunicipalities.length} ON municipalities, ${finderDistricts.length} BC districts)`
);

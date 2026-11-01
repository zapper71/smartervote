/**
 * Tracked elections and province tiles for the national landing pages.
 *
 * This is the ONLY election-date source for app/page.tsx, app/upcoming and
 * app/provinces. Dates here are the verified tracked list — nothing else
 * is claimed anywhere on these pages. Anything not listed here renders as
 * "Not yet tracked" (tiles) or "Coming soon" (finder / no candidate info).
 *
 * There is NO federal data anywhere in the repo, so every Federal tile
 * reads "Not yet tracked". No past-race loading is built here: every tile's
 * past-results area reads "We will load historical race data soon."
 * (deferred until a Supabase reset).
 */

export interface Province {
  slug: string;
  name: string;
  short: "ON" | "BC" | null;
}

/** All 13 provinces and territories, linked from the landing page. */
export const PROVINCES: Province[] = [
  { slug: "alberta", name: "Alberta", short: null },
  { slug: "british-columbia", name: "British Columbia", short: "BC" },
  { slug: "manitoba", name: "Manitoba", short: null },
  { slug: "new-brunswick", name: "New Brunswick", short: null },
  { slug: "newfoundland-and-labrador", name: "Newfoundland and Labrador", short: null },
  { slug: "nova-scotia", name: "Nova Scotia", short: null },
  { slug: "northwest-territories", name: "Northwest Territories", short: null },
  { slug: "nunavut", name: "Nunavut", short: null },
  { slug: "ontario", name: "Ontario", short: "ON" },
  { slug: "prince-edward-island", name: "Prince Edward Island", short: null },
  { slug: "quebec", name: "Quebec", short: null },
  { slug: "saskatchewan", name: "Saskatchewan", short: null },
  { slug: "yukon", name: "Yukon", short: null },
];

export function getProvince(slug: string): Province | undefined {
  return PROVINCES.find((p) => p.slug === slug);
}

/** Parse an ISO date (YYYY-MM-DD) as UTC noon, immune to local timezones. */
function parseDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** e.g. "Mon Nov 9, 2026". */
export function formatElectionDate(iso: string): string {
  return dateFmt.format(parseDate(iso));
}

export interface TrackedElection {
  provinceSlug: string;
  provinceName: string;
  level: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** False when no candidate info exists yet — renders "Coming soon". */
  hasCandidateInfo: boolean;
}

/**
 * The full tracked-elections list. The /upcoming window is computed from
 * this in code (see upcomingElections), never hardcoded to a date range.
 */
export const TRACKED_ELECTIONS: TrackedElection[] = [
  {
    provinceSlug: "british-columbia",
    provinceName: "British Columbia",
    level: "Provincial",
    date: "2026-10-24",
    hasCandidateInfo: true,
  },
  {
    provinceSlug: "ontario",
    provinceName: "Ontario",
    level: "Municipal",
    date: "2026-10-26",
    hasCandidateInfo: true,
  },
  {
    provinceSlug: "saskatchewan",
    provinceName: "Saskatchewan",
    level: "RM elections",
    date: "2026-11-09",
    hasCandidateInfo: true,
  },
  {
    provinceSlug: "northwest-territories",
    provinceName: "Northwest Territories",
    level: "Hamlet elections",
    date: "2026-12-14",
    hasCandidateInfo: false,
  },
];

/**
 * Elections finished within the last month PLUS elections coming up
 * within the next 3 months, relative to `now`, sorted by election date
 * ascending (earliest first). Calendar months, not a fixed day count.
 */
export function upcomingElections(now: Date = new Date()): TrackedElection[] {
  const pastCutoff = new Date(now);
  pastCutoff.setMonth(pastCutoff.getMonth() - 1);
  const futureCutoff = new Date(now);
  futureCutoff.setMonth(futureCutoff.getMonth() + 3);
  return TRACKED_ELECTIONS.filter((e) => {
    const d = parseDate(e.date);
    return d >= pastCutoff && d <= futureCutoff;
  }).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export interface TileRow {
  label?: string;
  /** Display text for the next election date, or "Not yet tracked". */
  date: string;
}

export interface ProvinceTiles {
  federal: TileRow[];
  provincial: TileRow[];
  municipal: TileRow[];
}

/**
 * The three tiles for a province page. Federal is "Not yet tracked"
 * everywhere (no federal data exists). Saskatchewan's municipal cycle is
 * split, so it carries all five splits as separate labeled rows — the
 * Nov 9 row is the next election date only and does NOT claim the Nov 9
 * listings are live (SK data is published separately). Everywhere else a
 * single municipal row uses a verified date from TRACKED_ELECTIONS when
 * one exists, else "Not yet tracked".
 */
export function provinceTiles(provinceSlug: string): ProvinceTiles {
  const notTracked: TileRow[] = [{ date: "Not yet tracked" }];
  const tiles: ProvinceTiles = {
    federal: notTracked,
    provincial: notTracked,
    municipal: notTracked,
  };
  if (provinceSlug === "british-columbia") {
    tiles.provincial = [{ date: formatElectionDate("2026-10-24") }];
  }
  if (provinceSlug === "ontario") {
    tiles.municipal = [{ date: formatElectionDate("2026-10-26") }];
  }
  if (provinceSlug === "saskatchewan") {
    tiles.municipal = [
      { label: "RM even-division councillors", date: formatElectionDate("2026-11-09") },
      { label: "RM odd divisions + reeve", date: formatElectionDate("2028-11-08") },
      { label: "Cities, towns and villages", date: formatElectionDate("2028-11-08") },
      { label: "Resort villages", date: formatElectionDate("2028-07-29") },
      { label: "Northern municipalities", date: "Fall 2028 (exact day TBD)" },
    ];
  }
  if (provinceSlug === "northwest-territories") {
    tiles.municipal = [{ date: formatElectionDate("2026-12-14") }];
  }
  return tiles;
}

/** Provinces with entries in the static index, i.e. with a working finder. */
export function hasFinderEntries(provinceSlug: string): boolean {
  const p = getProvince(provinceSlug);
  return p?.short === "ON" || p?.short === "BC";
}

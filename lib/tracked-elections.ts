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
  /** Display text for the election date, or "Not yet tracked". */
  date: string;
}

/** One tile's three sections: current race, next race, past races. */
export interface TileSection {
  current: TileRow[];
  next: TileRow[];
  past: TileRow[];
}

export interface ProvinceTiles {
  federal: TileSection;
  provincial: TileSection;
  municipal: TileSection;
}

/**
 * A tracked election cycle for one tile row.
 *
 * The tile rule (Andreas, Oct 31, 2026):
 * - The "Current race" line starts showing once the candidate filing
 *   deadline has passed.
 * - It stays current until one month after ALL results for that election
 *   are official, then it disappears from current and becomes a past race.
 * - The "Next race" line shows the next cycle's date, a few years out.
 *
 * allResultsOfficialDate stays null until every result for that election
 * is official; while it is null the race stays current (the one-month
 * clock has not started). Set it when the results chase completes and the
 * transition happens automatically. filingDeadline null means the deadline
 * is not yet confirmed — the race is never shown as current (NWT, whose
 * nominations close mid-November, exact day TBD).
 */
export interface TrackedCycle {
  row: TileRow;
  /** ISO date the candidate filing deadline passed, null if unconfirmed. */
  filingDeadline: string | null;
  /** ISO date ALL results became official, null if not yet all official. */
  allResultsOfficialDate: string | null;
  /** Next cycle for this row, as a display row (null = not yet tracked). */
  next: TileRow | null;
}

/** Calendar-month addition, same convention as upcomingElections. */
function addMonths(d: Date, months: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
}

function cycleSections(
  cycle: TrackedCycle,
  now: Date,
): TileSection {
  const next: TileRow[] = cycle.next ? [cycle.next] : [];
  if (cycle.filingDeadline === null) {
    // Deadline unconfirmed: never current, the election stays a next race.
    return { current: [], next: [cycle.row, ...next], past: [] };
  }
  const filed = parseDate(cycle.filingDeadline);
  if (now < filed) {
    return { current: [], next: [cycle.row, ...next], past: [] };
  }
  if (
    cycle.allResultsOfficialDate !== null &&
    now > addMonths(parseDate(cycle.allResultsOfficialDate), 1)
  ) {
    return { current: [], next, past: [cycle.row] };
  }
  return { current: [cycle.row], next, past: [] };
}

/**
 * The three tiles for a province page. Federal is "Not yet tracked"
 * everywhere (no federal data exists). Saskatchewan's municipal cycle is
 * split, so it carries all five splits as separate labeled rows — the
 * Nov 9 row is the current race (filing closed Oct 7, 2026, results not
 * yet all official) and does NOT claim the Nov 9 listings are live (SK
 * data is published separately); the 2028 splits are next races.
 * Everywhere else a single row uses a verified date from
 * TRACKED_ELECTIONS when one exists, else "Not yet tracked".
 */
export function provinceTiles(
  provinceSlug: string,
  now: Date = new Date(),
): ProvinceTiles {
  const notTracked = (): TileSection => ({
    current: [],
    next: [{ date: "Not yet tracked" }],
    past: [],
  });
  const merge = (sections: TileSection[]): TileSection => ({
    current: sections.flatMap((s) => s.current),
    next: sections.flatMap((s) => s.next),
    past: sections.flatMap((s) => s.past),
  });
  const tiles: ProvinceTiles = {
    federal: notTracked(),
    provincial: notTracked(),
    municipal: notTracked(),
  };
  if (provinceSlug === "british-columbia") {
    tiles.provincial = merge([
      cycleSections(
        {
          row: { date: formatElectionDate("2026-10-24") },
          filingDeadline: "2026-10-03",
          allResultsOfficialDate: null,
          next: {
            date: `${formatElectionDate("2030-10-19")} (scheduled)`,
          },
        },
        now,
      ),
    ]);
  }
  if (provinceSlug === "ontario") {
    tiles.municipal = merge([
      cycleSections(
        {
          row: { date: formatElectionDate("2026-10-26") },
          filingDeadline: "2026-08-21",
          allResultsOfficialDate: null,
          next: { date: formatElectionDate("2030-10-28") },
        },
        now,
      ),
    ]);
  }
  if (provinceSlug === "saskatchewan") {
    tiles.municipal = merge([
      cycleSections(
        {
          row: {
            label: "RM even-division councillors",
            date: formatElectionDate("2026-11-09"),
          },
          filingDeadline: "2026-10-07",
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
      cycleSections(
        {
          row: {
            label: "RM odd divisions + reeve",
            date: formatElectionDate("2028-11-08"),
          },
          filingDeadline: null,
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
      cycleSections(
        {
          row: {
            label: "Cities, towns and villages",
            date: formatElectionDate("2028-11-08"),
          },
          filingDeadline: null,
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
      cycleSections(
        {
          row: {
            label: "Resort villages",
            date: formatElectionDate("2028-07-29"),
          },
          filingDeadline: null,
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
      cycleSections(
        {
          row: {
            label: "Northern municipalities",
            date: "Fall 2028 (exact day TBD)",
          },
          filingDeadline: null,
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
    ]);
  }
  if (provinceSlug === "northwest-territories") {
    tiles.municipal = merge([
      cycleSections(
        {
          row: { date: formatElectionDate("2026-12-14") },
          filingDeadline: null,
          allResultsOfficialDate: null,
          next: null,
        },
        now,
      ),
    ]);
  }
  return tiles;
}

/** Provinces with entries in the static index, i.e. with a working finder. */
export function hasFinderEntries(provinceSlug: string): boolean {
  const p = getProvince(provinceSlug);
  return p?.short === "ON" || p?.short === "BC";
}

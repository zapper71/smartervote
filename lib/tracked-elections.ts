/**
 * Tracked elections and province tiles for the national landing pages.
 *
 * This is the ONLY election-date source for app/page.tsx, app/upcoming and
 * app/provinces. Dates here are the verified tracked list — nothing else
 * is claimed anywhere on these pages. Anything not listed here renders as
 * "Not yet tracked" (tiles) or "Coming soon" (finder / no candidate info).
 *
 * Federal next dates are included (next federal election, scheduled);
 * there is no federal candidate data, so no Federal tile has a current
 * race. Ontario and Nova Scotia provincial tiles stay "Not yet tracked":
 * both repealed their fixed-date laws in 2025, so there is no scheduled
 * provincial date to show (their constitutional latest dates are NOT
 * election dates and are deliberately not encoded). No past-race loading
 * is built here: every tile's past-results area reads "We will load
 * historical race data soon." (deferred until a Supabase reset).
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
  /** ISO date used to order races ascending; absent = unknown, sorts last. */
  sortDate?: string;
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
 * The three tiles for a province page. Federal carries the next federal
 * election (scheduled) everywhere. Provincial carries the next fixed
 * date (scheduled) everywhere except Ontario and Nova Scotia, which
 * have no fixed date. Municipal carries the next date everywhere;
 * Saskatchewan's cycle is split into five labeled rows and the NWT's
 * into its community classes. The Nov 9 SK row is the current race
 * (filing closed Oct 7, 2026, results not yet all official) and does NOT
 * claim the Nov 9 listings are live (SK data is published separately).
 * Anything without a verified next date stays "Not yet tracked".
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
  /** Display row for a verified ISO date. */
  const dated = (iso: string): TileRow => ({
    date: formatElectionDate(iso),
    sortDate: iso,
  });
  /** Display row for a fixed date that is still subject to an early call. */
  const scheduled = (iso: string): TileRow => ({
    date: `${formatElectionDate(iso)} (scheduled)`,
    sortDate: iso,
  });
  /** A next-only row: no current race tracked, just the next date. */
  const nextOnly = (row: TileRow): TileSection =>
    cycleSections(
      { row, filingDeadline: null, allResultsOfficialDate: null, next: null },
      now,
    );
  // Federal: third Monday in October in the fourth calendar year after
  // Apr 28, 2025 (Canada Elections Act), fixed but subject to dissolution.
  tiles.federal = nextOnly(scheduled("2029-10-15"));
  if (provinceSlug === "british-columbia") {
    tiles.provincial = merge([
      cycleSections(
        {
          row: {
            date: formatElectionDate("2026-10-24"),
            sortDate: "2026-10-24",
          },
          filingDeadline: "2026-10-03",
          allResultsOfficialDate: null,
          next: {
            date: `${formatElectionDate("2030-10-19")} (scheduled)`,
            sortDate: "2030-10-19",
          },
        },
        now,
      ),
    ]);
  }
  // Provincial next fixed dates (scheduled). Ontario and Nova Scotia are
  // deliberately absent: both repealed their fixed-date laws in 2025, so
  // no scheduled date exists — do not fill these with stale June/July
  // 2029 dates or with their constitutional latest dates.
  const provincialNext: Record<string, string> = {
    alberta: "2027-10-18",
    manitoba: "2027-10-05",
    "new-brunswick": "2028-10-16",
    "newfoundland-and-labrador": "2029-10-09",
    "prince-edward-island": "2027-10-04",
    quebec: "2030-10-07",
    saskatchewan: "2028-10-30",
    "northwest-territories": "2027-10-05",
    nunavut: "2029-10-29",
    yukon: "2029-11-05",
  };
  const provNext = provincialNext[provinceSlug];
  if (provNext) {
    tiles.provincial = nextOnly(scheduled(provNext));
  }
  // Municipal next dates. Three are weaker than the rest and are flagged
  // here, not on the site: NL (secondary sources only — no official page
  // states the 2029 date), PEI Resort Municipality (derived from the
  // Act's rule and the Aug 10, 2026 vote), and Yellowknife (derived from
  // its stated 2026–2030 term and its October cycle).
  const municipalNext: Record<string, TileRow[]> = {
    alberta: [dated("2029-10-15")],
    "british-columbia": [dated("2030-10-19")],
    manitoba: [
      { label: "Resort municipalities", ...dated("2030-07-26") },
      { label: "Most municipalities", ...dated("2030-10-23") },
    ],
    "new-brunswick": [dated("2030-05-13")],
    "newfoundland-and-labrador": [dated("2029-09-25")],
    "nova-scotia": [dated("2028-10-21")],
    "prince-edward-island": [
      { label: "All except Resort Municipality", ...dated("2026-11-02") },
      { label: "Resort Municipality", ...dated("2030-08-12") },
    ],
    quebec: [dated("2029-11-04")],
    nunavut: [dated("2027-10-25")],
    yukon: [dated("2028-10-19")],
  };
  const munNext = municipalNext[provinceSlug];
  if (munNext) {
    tiles.municipal = merge(munNext.map((row) => nextOnly(row)));
  }
  if (provinceSlug === "ontario") {
    tiles.municipal = merge([
      cycleSections(
        {
          row: {
            date: formatElectionDate("2026-10-26"),
            sortDate: "2026-10-26",
          },
          filingDeadline: "2026-08-21",
          allResultsOfficialDate: null,
          next: {
            date: formatElectionDate("2030-10-28"),
            sortDate: "2030-10-28",
          },
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
            sortDate: "2026-11-09",
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
            sortDate: "2028-11-08",
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
            sortDate: "2028-11-08",
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
            sortDate: "2028-07-29",
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
    // NWT municipal cycles are not uniform: hamlets vote Dec 14, 2026;
    // other communities run on their own cycles (councils may also vary
    // terms by bylaw), so each class gets its own labeled next row.
    tiles.municipal = merge([
      nextOnly({ label: "Hamlets", ...dated("2026-12-14") }),
      nextOnly({
        label: "Fort Good Hope (charter community)",
        ...dated("2027-07-19"),
      }),
      nextOnly({ label: "Cities, towns and villages", ...dated("2027-10-18") }),
      nextOnly({ label: "Tłįcho community governments", ...dated("2029-06-11") }),
      nextOnly({ label: "City of Yellowknife", ...dated("2030-10-21") }),
    ]);
  }
  // Current and next races render in ascending date order; races with an
  // unknown date (e.g. northern municipalities, exact day TBD) sort last.
  // Stable sort keeps the listed order for same-day rows.
  const byDateAsc = (a: TileRow, b: TileRow): number => {
    const da = a.sortDate ?? "9999";
    const db = b.sortDate ?? "9999";
    return da < db ? -1 : da > db ? 1 : 0;
  };
  for (const tile of [tiles.federal, tiles.provincial, tiles.municipal]) {
    tile.current.sort(byDateAsc);
    tile.next.sort(byDateAsc);
    tile.past.sort(byDateAsc);
  }
  return tiles;
}

/** Provinces with entries in the static index, i.e. with a working finder. */
export function hasFinderEntries(provinceSlug: string): boolean {
  const p = getProvince(provinceSlug);
  return p?.short === "ON" || p?.short === "BC";
}

/**
 * Which finder, if any, a province page's tile can open. Finder data
 * covers Ontario municipalities and BC electoral districts only — every
 * other province/level has no finder to open, so its tiles stay plain.
 * See docs/finder-terminology.md for the level language used here.
 */
export function finderFor(
  provinceSlug: string,
  level: "federal" | "provincial" | "municipal",
): {
  initialProvince: "ON" | "BC" | "SK";
  entity: "municipality" | "district";
} | null {
  if (provinceSlug === "ontario" && level === "municipal") {
    return { initialProvince: "ON", entity: "municipality" };
  }
  if (provinceSlug === "british-columbia" && level === "provincial") {
    return { initialProvince: "BC", entity: "district" };
  }
  if (provinceSlug === "saskatchewan" && level === "municipal") {
    return { initialProvince: "SK", entity: "municipality" };
  }
  return null;
}

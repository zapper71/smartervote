"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ExpansionRace } from "@/lib/expansion-index";
import WithdrawnPill from "@/components/WithdrawnPill";
import WinnerPill from "@/components/WinnerPill";
import ResultsNotAvailablePill from "@/components/ResultsNotAvailablePill";
import PartyPill from "@/components/PartyPill";
import { formatUi, localizePath, pluralize, type Locale } from "@/lib/i18n";

export interface MunicipalityRaceGroup {
  key: string;
  label: string;
  races: { race: ExpansionRace; dataLoaded: boolean | null }[];
}

const FILTER_THRESHOLD = 8;
const FILTER_CAP = 60;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(name: string, q: string): boolean {
  const n = normalise(name);
  if (q === "") return true;
  if (n.includes(q)) return true;
  const words = q.split(/\s+/).filter(Boolean);
  return words.length > 1 && words.every((w) => n.includes(w));
}

function rank(name: string, q: string): number {
  const n = normalise(name);
  if (q === "") return 1;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return 3;
}

/** A malformed source URL must never break rendering. */
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** English chrome defaults; `strings` overrides per key when provided. */
const RACE_LIST_DEFAULTS = {
  "race_list.compare_link": "Compare the {count} candidates →",
  "race_list.positions_loaded": "Positions loaded",
  "race_list.list_only": "Candidate list only",
  "race_list.candidates": "{count} candidate(s)",
  "race_list.seats": "{seats} seat(s)",
  "race_list.acclaimed_suffix": " · acclaimed",
  "race_list.source_label": "Candidate list source: ",
  "race_list.filter_label": "Find a race",
  "race_list.filter_placeholder": "e.g. Mayor, Etobicoke, Ward 1…",
  "race_list.filter_count": "{count} races · type to filter",
  "race_list.no_match":
    "No races match “{query}”. Try a nearby ward or “Mayor”.",
  "pill.acclaimed": "Acclaimed",
  "pill.elected": "Elected",
  "pill.elected_unofficial": "Elected — unofficial result",
  "pill.elected_official_title": "Elected — official result",
  "pill.withdrawn": "Withdrawn",
  "pill.withdrawn_title":
    "Withdrew after nomination; still on the printed ballot",
  "results.pill": "Results not available",
  "results.pill_title": "No result recorded for this race yet",
} as const;

function RaceEntry({
  race,
  dataLoaded,
  locale = "en",
  strings,
}: {
  race: ExpansionRace;
  /** null = the database check failed; render no tag rather than a wrong one. */
  dataLoaded: boolean | null;
  /** Page locale — the race + compare links stay in the page language. */
  locale?: Locale;
  /** Localised chrome strings (race_list.* + pill.*). Omit for English. */
  strings?: Record<string, string>;
}) {
  const t: Record<string, string> = { ...RACE_LIST_DEFAULTS, ...(strings ?? {}) };
  const count = race.candidates.length;
  const acclaimedCount = race.candidates.filter((c) => c.acclaimed).length;
  // Broad results rule (Andreas, 2026-10-27): a race with no flagged
  // winner in the index carries the "Results not available" tag. It
  // clears on its own when the index winner patch for that race lands.
  const hasWinner = race.candidates.some((c) => c.winner);
  // Same "· acclaimed" rule as the line below: every candidate acclaimed
  // means the seat was decided without an election, so no
  // "Results not available" tag even before a winner flag lands.
  const fullyAcclaimed = count > 0 && count === acclaimedCount;
  // A one-horse race has nothing to compare — same rule as the race page.
  const contested = count > 1 && (race.seats == null || count > race.seats);
  return (
    <li className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base">
          <Link
            href={localizePath(`/races/${race.slug}`, locale)}
            className="text-ink no-underline hover:text-accent"
          >
            {race.name}
          </Link>
        </h3>
        {!hasWinner && !fullyAcclaimed && (
          <ResultsNotAvailablePill
            labels={{
              label: t["results.pill"],
              title: t["results.pill_title"],
            }}
          />
        )}
        {dataLoaded !== null &&
          (dataLoaded ? (
            contested ? (
              <Link
                href={localizePath(`/races/${race.slug}/compare`, locale)}
                className="link tap-target text-sm font-medium"
              >
                {formatUi(t["race_list.compare_link"], { count })}
              </Link>
            ) : (
              <span className="text-xs text-ink-faint">
                {t["race_list.positions_loaded"]}
              </span>
            )
          ) : (
            <span className="text-xs text-ink-faint">
              {t["race_list.list_only"]}
            </span>
          ))}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {pluralize(formatUi(t["race_list.candidates"], { count }), count)}
        {race.seats
          ? ` · ${pluralize(formatUi(t["race_list.seats"], { seats: race.seats }), race.seats)}`
          : ""}
        {acclaimedCount > 0 && count === acclaimedCount
          ? t["race_list.acclaimed_suffix"]
          : ""}
      </p>
      {count > 0 && (
        // Two-column candidate grid (Andreas, 2026-11-27): the old flex-wrap
        // pill row read as one crowded paragraph on 8–9 candidate races.
        // 1 left / 2 right, 3 below 1 / 4 below 2, evenly spaced. Single
        // column on phones (chips are too wide for two-up at 375px).
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {race.candidates.map((c) => (
            <li
              key={c.name}
              className="rounded-md border border-paper-edge bg-paper-warm px-2.5 py-1 text-sm"
            >
              {/* Andreas's listings-tier rule: where a race is listing-only,
                  the candidate's name links to their own website when one is
                  on file. The race heading above still links to the internal
                  race page, so candidates with researched positions lose
                  nothing. Candidates with no website on file stay plain text. */}
              {c.website ? (
                <a
                  href={c.website}
                  className="link"
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  <span className={c.withdrawn ? "line-through" : undefined}>
                    {c.name}
                  </span>
                  <span aria-hidden="true" className="ml-0.5 text-xs">
                    ↗
                  </span>
                  <span className="sr-only">
                    {" "}
                    — {c.name}&rsquo;s campaign website, opens in a new tab
                  </span>
                </a>
              ) : (
                <span className="text-ink">
                  <span className={c.withdrawn ? "line-through" : undefined}>
                    {c.name}
                  </span>
                </span>
              )}
              <PartyPill party={c.party} />
              {c.acclaimed && (
                <span className="ml-1 text-xs font-medium text-flag">
                  {t["pill.acclaimed"]}
                </span>
              )}
              {/* Withdrawn candidates stay on the printed ballot, so they
                  stay listed — struck through with the grey Withdrawn pill. */}
              {c.withdrawn && (
                <span className="ml-1.5">
                  <WithdrawnPill
                    labels={{
                      withdrawn: t["pill.withdrawn"],
                      title: t["pill.withdrawn_title"],
                    }}
                  />
                </span>
              )}
              {/* Winners get the Elected checkmark (migration 41 data,
                  carried into the static index by the generator's winners
                  overlay). Absent until results are recorded. */}
              {c.winner && (
                <span className="ml-1.5">
                  <WinnerPill
                    isWinner
                    resultStatus={c.resultStatus}
                    labels={{
                      elected: t["pill.elected"],
                      electedUnofficial: t["pill.elected_unofficial"],
                      electedOfficialTitle: t["pill.elected_official_title"],
                    }}
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {race.sources.length > 0 && (
        <p className="mt-3 text-xs text-ink-faint">
          {t["race_list.source_label"]}
          {race.sources.map((s, i) => (
            <span key={s}>
              {i > 0 && ", "}
              <a
                href={s}
                className="link"
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                {hostnameOf(s)}
              </a>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

/**
 * The municipality race-selection step: groups of race cards, each one an
 * explicit entry point — a compare link when the race has published
 * positions (the Huntsville pattern), an honest "candidate list only" state
 * otherwise. For large municipalities a type-to-filter box narrows the
 * races with case-insensitive contains matching (so "etobicoke" finds
 * "Councillor - Ward 1 (Etobicoke North)" etc.).
 */
export default function MunicipalityRaceList({
  groups,
  locale = "en",
  strings,
}: {
  groups: MunicipalityRaceGroup[];
  /** Page locale — the race + compare links stay in the page language. */
  locale?: Locale;
  /** Localised chrome strings (race_list.* + pill.*). Omit for English. */
  strings?: Record<string, string>;
}) {
  const t: Record<string, string> = { ...RACE_LIST_DEFAULTS, ...(strings ?? {}) };
  const [query, setQuery] = useState("");
  const totalRaces = groups.reduce((n, g) => n + g.races.length, 0);
  const showFilter = totalRaces > FILTER_THRESHOLD;

  const filtered = useMemo(() => {
    const q = normalise(query.trim());
    return groups
      .map((g) => {
        const races = g.races
          .filter(({ race }) => matches(race.name, q))
          .sort(
            (a, b) => rank(a.race.name, q) - rank(b.race.name, q)
          )
          .slice(0, FILTER_CAP);
        return { ...g, races };
      })
      .filter((g) => g.races.length > 0);
  }, [groups, query]);

  const shown = filtered.reduce((n, g) => n + g.races.length, 0);

  return (
    <div>
      {showFilter && (
        <div className="mt-6">
          <label
            htmlFor="race-filter"
            className="block text-sm font-medium text-ink"
          >
            {t["race_list.filter_label"]}
          </label>
          <input
            id="race-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t["race_list.filter_placeholder"]}
            autoComplete="off"
            className="mt-2 w-full rounded-md border border-paper-edge bg-paper-warm px-4 py-3 text-base text-ink placeholder:text-ink-faint"
          />
          <p className="mt-2 text-xs text-ink-faint">
            {formatUi(t["race_list.filter_count"], { count: totalRaces })}
          </p>
        </div>
      )}

      {shown === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">
          {formatUi(t["race_list.no_match"], { query: query.trim() })}
        </p>
      ) : (
        filtered.map((g) => (
          <section
            key={g.key}
            aria-labelledby={`group-${g.key}`}
            className="mt-10"
          >
            <h2 id={`group-${g.key}`} className="mb-4 text-xl">
              {g.label}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {g.races.map(({ race, dataLoaded }) => (
                <RaceEntry
                  key={race.slug}
                  race={race}
                  dataLoaded={dataLoaded}
                  locale={locale}
                  strings={strings}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

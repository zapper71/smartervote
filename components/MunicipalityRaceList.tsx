"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ExpansionRace } from "@/lib/expansion-index";
import WithdrawnPill from "@/components/WithdrawnPill";

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

function RaceEntry({
  race,
  dataLoaded,
}: {
  race: ExpansionRace;
  /** null = the database check failed; render no tag rather than a wrong one. */
  dataLoaded: boolean | null;
}) {
  const count = race.candidates.length;
  const acclaimedCount = race.candidates.filter((c) => c.acclaimed).length;
  // Same rule as Huntsville's RaceCard: a one-horse race has nothing to compare.
  const contested = count > 1 && (race.seats == null || count > race.seats);
  return (
    <li className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base">
          <Link
            href={`/races/${race.slug}`}
            className="text-ink no-underline hover:text-accent"
          >
            {race.name}
          </Link>
        </h3>
        {dataLoaded !== null &&
          (dataLoaded ? (
            contested ? (
              <Link
                href={`/races/${race.slug}/compare`}
                className="link tap-target text-sm font-medium"
              >
                Compare the {count} candidates &rarr;
              </Link>
            ) : (
              <span className="text-xs text-ink-faint">Positions loaded</span>
            )
          ) : (
            <span className="text-xs text-ink-faint">Candidate list only</span>
          ))}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {count} candidate{count === 1 ? "" : "s"}
        {race.seats ? ` · ${race.seats} seat${race.seats === 1 ? "" : "s"}` : ""}
        {acclaimedCount > 0 && count === acclaimedCount
          ? " · acclaimed"
          : ""}
      </p>
      {count > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
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
              {c.party && (
                <span className="text-ink-faint"> · {c.party}</span>
              )}
              {c.acclaimed && (
                <span className="ml-1 text-xs font-medium text-flag">
                  Acclaimed
                </span>
              )}
              {/* Withdrawn candidates stay on the printed ballot, so they
                  stay listed — struck through with the grey Withdrawn pill. */}
              {c.withdrawn && (
                <span className="ml-1.5">
                  <WithdrawnPill />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {race.sources.length > 0 && (
        <p className="mt-3 text-xs text-ink-faint">
          Candidate list source:{" "}
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
}: {
  groups: MunicipalityRaceGroup[];
}) {
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
            Find a race
          </label>
          <input
            id="race-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Mayor, Etobicoke, Ward 1…"
            autoComplete="off"
            className="mt-2 w-full rounded-md border border-paper-edge bg-paper-warm px-4 py-3 text-base text-ink placeholder:text-ink-faint"
          />
          <p className="mt-2 text-xs text-ink-faint">
            {totalRaces} races · type to filter
          </p>
        </div>
      )}

      {shown === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">
          No races match &ldquo;{query.trim()}&rdquo;. Try a nearby ward or
          “Mayor”.
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
                <RaceEntry key={race.slug} race={race} dataLoaded={dataLoaded} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FINDER_DISTRICTS,
  FINDER_MUNICIPALITIES,
  FINDER_RACE_ALIASES,
  FINDER_COMMUNITY_ALIASES,
} from "@/lib/expansion-finder";

type Province = "ON" | "BC";

/** Cap on rendered filtered rows; empty-query browse-all renders the full list. */
const FILTER_CAP = 80;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface FinderEntry {
  key: string;
  name: string;
  href: string;
  /** Short "why it matched" line, only shown for ward/community matches. */
  sub?: string;
  /** Direct race row (ward/riding), shown below its parent municipality. */
  raceSlug?: string;
}

/** Cap on filtered race rows shown below the parent municipality. */
const RACE_ROW_CAP = 3;

/** Race aliases grouped by municipality slug, for ward/riding search. */
const raceAliasesByMuni: Map<string, typeof FINDER_RACE_ALIASES> = new Map();
for (const r of FINDER_RACE_ALIASES) {
  const list = raceAliasesByMuni.get(r.muniSlug) ?? [];
  list.push(r);
  raceAliasesByMuni.set(r.muniSlug, list);
}
/** Curated community aliases grouped by municipality slug. */
const communityAliasesByMuni: Map<string, string[]> = new Map();
for (const c of FINDER_COMMUNITY_ALIASES) {
  const list = communityAliasesByMuni.get(c.muniSlug) ?? [];
  list.push(c.name);
  communityAliasesByMuni.set(c.muniSlug, list);
}

/**
 * Short display name for a matched race alias: the parenthesised place
 * segment when it's short (e.g. "Etobicoke North"), else the full label.
 */
function aliasDisplay(a: (typeof FINDER_RACE_ALIASES)[number]): string {
  for (const p of a.places) {
    if (p.length <= 28) return p;
  }
  return a.label;
}

interface OnMatch {
  entry: FinderEntry;
  /** 0 exact name, 1 starts-with, 2 contains, 3 alias-only. */
  ownRank: number;
}

function onEntries(q: string): { municipalities: FinderEntry[]; raceRows: FinderEntry[] } {
  const matched: OnMatch[] = [];
  const raceRows: FinderEntry[] = [];
  const anyAliasOnly = q !== "";

  for (const m of FINDER_MUNICIPALITIES) {
    const n = normalise(m.name);
    let ownRank: number | null = null;
    if (q === "") ownRank = 1;
    else if (n === q) ownRank = 0;
    else if (n.startsWith(q)) ownRank = 1;
    else if (n.includes(q)) ownRank = 2;

    // Ward/riding + community aliases: matched display names for the sublabel.
    const displays = new Set<string>();
    const matchedRaces: typeof FINDER_RACE_ALIASES = [];
    for (const r of raceAliasesByMuni.get(m.slug) ?? []) {
      const hit =
        matches(r.label, q) || r.places.some((p) => matches(p, q));
      if (hit) {
        displays.add(aliasDisplay(r));
        matchedRaces.push(r);
      }
    }
    for (const name of communityAliasesByMuni.get(m.slug) ?? []) {
      if (matches(name, q)) displays.add(name);
    }

    if (ownRank === null && displays.size === 0) continue;

    const sub =
      ownRank === null
        ? `Includes ${[...displays].slice(0, 3).join(", ")}`
        : undefined;
    matched.push({
      entry: {
        key: m.slug,
        name: m.name,
        href: municipalityHref(m.slug),
        sub,
      },
      ownRank: ownRank ?? 3,
    });

    // Direct race rows only when the parent matched via alias, not by name —
    // keeps own-name searches (e.g. "waterloo") uncluttered.
    if (ownRank === null && anyAliasOnly) {
      for (const r of matchedRaces.slice(0, RACE_ROW_CAP)) {
        raceRows.push({
          key: r.raceSlug,
          name: r.label,
          sub: `${m.name} · ward race`,
          href: `/races/${r.raceSlug}`,
          raceSlug: r.raceSlug,
        });
      }
    }
  }

  matched.sort((a, b) => a.ownRank - b.ownRank || a.entry.name.localeCompare(b.entry.name));
  return {
    municipalities: matched.map((m) => m.entry),
    raceRows: raceRows.slice(0, RACE_ROW_CAP),
  };
}

function bcEntries(): FinderEntry[] {
  return FINDER_DISTRICTS.map((d) => ({
    key: d.raceSlug,
    name: d.name,
    href: `/races/${d.raceSlug}`,
  }));
}

/**
 * Case-insensitive CONTAINS matching: every typed word must appear somewhere
 * in the name, in any order — so "etobicoke" also finds
 * "Councillor - Ward 1 (Etobicoke North)" and "tobicoke" matches mid-word.
 */
function matches(name: string, q: string): boolean {
  const n = normalise(name);
  if (q === "") return true;
  if (n.includes(q)) return true;
  const words = q.split(/\s+/).filter(Boolean);
  return words.length > 1 && words.every((w) => n.includes(w));
}

/** Rank: exact match first, then starts-with, then other contains matches. */
function rank(name: string, q: string): number {
  const n = normalise(name);
  if (q === "") return 1;
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return 3;
}

/**
 * The election finder: province toggle + a combobox — click the field and
 * scroll the full list, or type to filter — over the static expansion index.
 * No database needed — this works on the preview before migrations 24–28
 * are run.
 *
 * Ontario results link to /municipalities/[slug] (a listings page until
 * positions are imported). A BC district IS its race, so districts link
 * straight to /races/[district race slug].
 */
export default function MunicipalityFinder() {
  const [province, setProvince] = useState<Province>("ON");
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const q = normalise(trimmed);

  const { shown, total } = useMemo(() => {
    if (province === "ON") {
      const { municipalities, raceRows } = onEntries(q);
      // Browse-all (empty query) renders the whole scrollable list; filtered
      // results are capped with a count so contains matches are never hidden
      // silently.
      const cap = q === "" ? municipalities.length : FILTER_CAP;
      return {
        shown: [...municipalities.slice(0, cap), ...raceRows],
        total: municipalities.length + raceRows.length,
      };
    }
    const matched = bcEntries()
      .filter((e) => matches(e.name, q))
      .sort((a, b) => rank(a.name, q) - rank(b.name, q));
    const cap = q === "" ? matched.length : FILTER_CAP;
    return { shown: matched.slice(0, cap), total: matched.length };
  }, [province, q]);

  const plural = province === "ON" ? "municipalities" : "districts";

  return (
    <div className="mt-6 rounded-lg border border-paper-edge bg-paper p-5 shadow-sm">
      {/* Province toggle */}
      <div role="group" aria-label="Province" className="flex gap-2">
        {(
          [
            ["ON", "Ontario"],
            ["BC", "British Columbia"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={province === value}
            onClick={() => {
              setProvince(value);
              setQuery("");
            }}
            className={`tap-target rounded-md px-4 py-2 text-sm font-medium no-underline ${
              province === value
                ? "bg-accent text-white"
                : "border border-paper-edge text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mt-4">
        <label
          htmlFor="finder-search"
          className="block text-sm font-medium text-ink"
        >
          {province === "ON"
            ? "Find your municipality"
            : "Find your electoral district"}
        </label>
        <input
          id="finder-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            province === "ON"
              ? "e.g. Toronto, Ottawa, Muskoka Lakes…"
              : "e.g. Abbotsford South, Victoria…"
          }
          autoComplete="off"
          aria-describedby="finder-hint finder-count"
          className="mt-2 w-full rounded-md border border-paper-edge bg-paper-warm px-4 py-3 text-base text-ink placeholder:text-ink-faint"
        />
        <p id="finder-hint" className="mt-2 text-xs text-ink-faint">
          {province === "ON"
            ? `${FINDER_MUNICIPALITIES.length} Ontario municipalities · scroll the list or type to filter — wards & communities work too (e.g. Etobicoke, New Hamburg)`
            : `${FINDER_DISTRICTS.length} BC electoral districts · scroll the list or type to filter`}
        </p>
      </div>

      {/* Results */}
      <div className="mt-2">
        <p id="finder-count" aria-live="polite" className="sr-only">
          {total === 0
            ? `No matches for ${trimmed}.`
            : `${total} match${total === 1 ? "" : "es"}${
                trimmed === "" ? " — the full list." : ` for ${trimmed}.`
              }`}
        </p>
        {total === 0 && (
          <p className="mt-3 text-sm text-ink-soft">
            No {plural} match &ldquo;{trimmed}&rdquo;. Check the spelling, or
            try a nearby place.
          </p>
        )}
        {shown.length > 0 && (
          <>
            <ul className="mt-3 max-h-72 divide-y divide-paper-edge overflow-y-auto rounded-md border border-paper-edge">
              {shown.map((r) => (
                <li key={r.key}>
                  <Link
                    href={r.href}
                    className="tap-target flex w-full items-center justify-between gap-3 px-4 py-3 text-ink no-underline hover:bg-accent-light"
                  >
                    <span>
                      <span className="block font-medium">{r.name}</span>
                      {r.sub && (
                        <span className="block text-xs text-ink-faint">
                          {r.sub}
                        </span>
                      )}
                    </span>
                    <span aria-hidden="true" className="text-accent">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {total > shown.length && (
              <p className="mt-2 text-xs text-ink-faint">
                Showing {shown.length} of {total} — keep typing to narrow it
                down.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Huntsville's canonical pages are /races/* (unprefixed slugs, unchanged).
 * It never goes through /municipalities/huntsville.
 */
function municipalityHref(slug: string): string {
  return slug === "huntsville" ? "/races" : `/municipalities/${slug}`;
}

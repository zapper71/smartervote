"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FINDER_DISTRICTS,
  FINDER_MUNICIPALITIES,
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
}

function onEntries(): FinderEntry[] {
  return FINDER_MUNICIPALITIES.map((m) => ({
    key: m.slug,
    name: m.name,
    href: municipalityHref(m.slug),
  }));
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

  const allEntries = useMemo(
    () => (province === "ON" ? onEntries() : bcEntries()),
    [province]
  );

  const trimmed = query.trim();
  const q = normalise(trimmed);

  const { shown, total } = useMemo(() => {
    const matched = allEntries
      .filter((e) => matches(e.name, q))
      .sort((a, b) => rank(a.name, q) - rank(b.name, q));
    // Browse-all (empty query) renders the whole scrollable list; filtered
    // results are capped with a count so contains matches are never hidden
    // silently.
    const cap = q === "" ? matched.length : FILTER_CAP;
    return { shown: matched.slice(0, cap), total: matched.length };
  }, [allEntries, q]);

  const noun = province === "ON" ? "municipality" : "district";
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
          {allEntries.length} {plural} · scroll the list or type to filter
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
                    <span className="font-medium">{r.name}</span>
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

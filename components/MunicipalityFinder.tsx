"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FINDER_DISTRICTS,
  FINDER_MUNICIPALITIES,
} from "@/lib/expansion-finder";

type Province = "ON" | "BC";

const MAX_RESULTS = 10;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * The election finder: province toggle + search-as-you-type over the static
 * expansion index. No database needed — this works on the preview before
 * migrations 24–28 are run.
 *
 * Ontario results link to /municipalities/[slug] (a listings page until
 * positions are imported). A BC district IS its race, so districts link
 * straight to /races/[district race slug].
 */
export default function MunicipalityFinder() {
  const [province, setProvince] = useState<Province>("ON");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = normalise(query.trim());
    if (province === "ON") {
      const list = FINDER_MUNICIPALITIES.filter((m) =>
        q === "" ? false : normalise(m.name).includes(q)
      );
      return list
        .slice(0, MAX_RESULTS)
        .map((m) => ({ key: m.slug, name: m.name, href: municipalityHref(m.slug) }));
    }
    const list = FINDER_DISTRICTS.filter((d) =>
      q === "" ? false : normalise(d.name).includes(q)
    );
    return list
      .slice(0, MAX_RESULTS)
      .map((d) => ({ key: d.raceSlug, name: d.name, href: `/races/${d.raceSlug}` }));
  }, [province, query]);

  const totalForProvince =
    province === "ON" ? FINDER_MUNICIPALITIES.length : FINDER_DISTRICTS.length;
  const trimmed = query.trim();

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
            ? `${FINDER_MUNICIPALITIES.length} Ontario municipalities · start typing to filter`
            : `${FINDER_DISTRICTS.length} BC electoral districts · start typing to filter`}
        </p>
      </div>

      {/* Results */}
      <div className="mt-2">
        <p id="finder-count" aria-live="polite" className="sr-only">
          {trimmed === ""
            ? "Type to search."
            : results.length === 0
              ? `No matches for ${trimmed}.`
              : `${results.length} match${results.length === 1 ? "" : "es"} for ${trimmed}.`}
        </p>
        {trimmed !== "" && results.length === 0 && (
          <p className="mt-3 text-sm text-ink-soft">
            No {province === "ON" ? "municipalities" : "districts"} match
            &ldquo;{trimmed}&rdquo;. Check the spelling, or try a nearby place.
          </p>
        )}
        {results.length > 0 && (
          <ul className="mt-3 divide-y divide-paper-edge rounded-md border border-paper-edge">
            {results.map((r) => (
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

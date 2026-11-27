"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FINDER_DISTRICTS,
  FINDER_MUNICIPALITIES,
  FINDER_RACE_ALIASES,
  FINDER_COMMUNITY_ALIASES,
  type FinderMunicipality,
} from "@/lib/expansion-finder";
import { FINDER_SASKATCHEWAN } from "@/lib/sk-finder";
import {
  FINDER_FEDERAL_ON,
  FINDER_FEDERAL_QC,
  FINDER_FEDERAL_SK,
} from "@/lib/federal-finder";
import { localizePath, type Locale } from "@/lib/i18n";

type Province = "ON" | "BC" | "SK" | "QC";

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

function onEntries(
  q: string,
  list: FinderMunicipality[],
  locale: Locale = "en",
): { municipalities: FinderEntry[]; raceRows: FinderEntry[] } {
  const matched: OnMatch[] = [];
  const raceRows: FinderEntry[] = [];
  const anyAliasOnly = q !== "";

  for (const m of list) {
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
        href: municipalityHref(m.slug, locale),
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
          href: localizePath(`/races/${r.raceSlug}`, locale),
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

function bcEntries(locale: Locale = "en"): FinderEntry[] {
  return FINDER_DISTRICTS.map((d) => ({
    key: d.raceSlug,
    name: d.name,
    href: localizePath(`/races/${d.raceSlug}`, locale),
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
 * straight to /races/[district race slug]. Saskatchewan results link to
 * /municipalities/[slug] like Ontario's; the SK list is the 15 RMs with
 * live pages, from lib/sk-finder.ts. Quebec results are the three
 * federal byelection ridings (Dec 7, 2026), from lib/federal-finder.ts;
 * the two Ontario and one Saskatchewan ridings are appended to those
 * provinces' lists from the same file.
 */
/**
 * Per-province finder lists, keyed by province — never default to
 * another province's list. A future province MUST be added here (and
 * to `Province` above) or TypeScript fails the build instead of the
 * finder silently showing Ontario's municipalities. BC is districts,
 * handled by bcEntries() below, so it carries empty lists here.
 */
const PROVINCE_LISTS: Record<
  Province,
  { municipalities: FinderMunicipality[]; federal: FinderMunicipality[] }
> = {
  ON: { municipalities: FINDER_MUNICIPALITIES, federal: FINDER_FEDERAL_ON },
  SK: { municipalities: FINDER_SASKATCHEWAN, federal: FINDER_FEDERAL_SK },
  QC: { municipalities: [], federal: FINDER_FEDERAL_QC },
  BC: { municipalities: [], federal: [] },
};

/**
 * Optional preset for province pages: when given, the finder starts on
 * that province and the toggle is hidden (the page is already scoped to
 * it). Without it the finder behaves as before, ON by default.
 * autoFocus puts the cursor in the search field on the dedicated finder
 * page (desktop browsers honour it; mobile browsers may not open the
 * keyboard until the user taps, which is fine — the field still fills
 * the screen).
 * `entity` scopes the list to a level: "riding" shows only the
 * province's federal ridings; anything else shows the province's
 * municipalities (BC: districts). The finder page passes the entity
 * its tile's level resolved to — without it a federal tile would open
 * the municipality list with the ridings buried in it.
 */
export default function MunicipalityFinder({
  initialProvince,
  entity,
  autoFocus = false,
  locale = "en",
}: {
  initialProvince?: Province;
  entity?: "municipality" | "district" | "riding";
  autoFocus?: boolean;
  /** Page locale — every result link stays in the page language. */
  locale?: Locale;
} = {}) {
  const [province, setProvince] = useState<Province>(initialProvince ?? "ON");
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const q = normalise(trimmed);

  const { shown, total, listLength } = useMemo(() => {
    if (province !== "BC") {
      // ON and SK share the municipality path; SK slugs simply have no
      // ward/community aliases, so their alias lookups come back empty.
      // Ridings only when this finder is scoped to the federal level;
      // otherwise the province's municipalities with its federal
      // ridings appended (QC has no municipal list — ridings only
      // either way). The generated finder file only covers ON
      // municipalities + BC districts; the federal lists are
      // hand-maintained in lib/federal-finder.ts.
      const lists = PROVINCE_LISTS[province];
      const list =
        entity === "riding"
          ? lists.federal
          : [...lists.municipalities, ...lists.federal];
      const { municipalities, raceRows } = onEntries(q, list, locale);
      // Browse-all (empty query) renders the whole scrollable list; filtered
      // results are capped with a count so contains matches are never hidden
      // silently.
      const cap = q === "" ? municipalities.length : FILTER_CAP;
      return {
        shown: [...municipalities.slice(0, cap), ...raceRows],
        total: municipalities.length + raceRows.length,
        listLength: list.length,
      };
    }
    const matched = bcEntries(locale)
      .filter((e) => matches(e.name, q))
      .sort((a, b) => rank(a.name, q) - rank(b.name, q));
    const cap = q === "" ? matched.length : FILTER_CAP;
    return {
      shown: matched.slice(0, cap),
      total: matched.length,
      listLength: matched.length,
    };
  }, [province, q, entity, locale]);

  const isRiding = entity === "riding";
  const plural =
    province === "BC"
      ? "districts"
      : isRiding || province === "QC"
        ? "ridings"
        : "municipalities";

  return (
    <div className="mt-6 rounded-lg border border-paper-edge bg-paper p-5 shadow-sm">
      {/* Province toggle — hidden when the page presets a province */}
      {!initialProvince && (
      <div role="group" aria-label="Province" className="flex gap-2">
        {(
          [
            ["ON", "Ontario"],
            ["BC", "British Columbia"],
            ["SK", "Saskatchewan"],
            ["QC", "Quebec"],
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
      )}

      {/* Search */}
      <div className="mt-4">
        <label
          htmlFor="finder-search"
          className="block text-sm font-medium text-ink"
        >
          {province === "BC"
            ? "Find your district"
            : isRiding || province === "QC"
              ? "Find your riding"
              : "Find your municipality"}
        </label>
        <input
          id="finder-search"
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            province === "BC"
              ? "e.g. Abbotsford South, Victoria…"
              : isRiding
                ? province === "ON"
                  ? "e.g. Scarborough North, Brantford–Brant South…"
                  : province === "SK"
                    ? "e.g. Yorkton–Melville…"
                    : "e.g. Laurier–Sainte-Marie, Rosemont…"
                : province === "ON"
                  ? "e.g. Toronto, Ottawa, Muskoka Lakes…"
                  : province === "SK"
                    ? "e.g. Corman Park, Edenwold…"
                    : "e.g. Laurier–Sainte-Marie, Rosemont…"
          }
          autoComplete="off"
          aria-describedby="finder-hint finder-count"
          className="mt-2 w-full rounded-md border border-paper-edge bg-paper-warm px-4 py-3 text-base text-ink placeholder:text-ink-faint"
        />
        <p id="finder-hint" className="mt-2 text-xs text-ink-faint">
          {province === "BC"
            ? `${FINDER_DISTRICTS.length} BC districts · scroll the list or type to filter`
            : isRiding
              ? `${listLength} ${province === "ON" ? "Ontario" : province === "SK" ? "Saskatchewan" : "Quebec"} riding${listLength === 1 ? "" : "s"} · scroll the list or type to filter`
              : province === "ON"
                ? `${listLength} Ontario municipalities and ridings · scroll the list or type to filter — wards & communities work too (e.g. Etobicoke, New Hamburg)`
                : province === "SK"
                  ? `${listLength} Saskatchewan municipalities and ridings · scroll the list or type to filter`
                  : `${listLength} Quebec ridings · scroll the list or type to filter`}
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

/** Every municipality's race list lives at /municipalities/<slug>. */
function municipalityHref(slug: string, locale: Locale = "en"): string {
  return localizePath(`/municipalities/${slug}`, locale);
}

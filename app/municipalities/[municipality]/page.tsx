import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import {
  MUNICIPALITIES,
  RACES_BY_MUNICIPALITY,
  type ExpansionRace,
} from "@/lib/expansion-index";
import { getExistingRaceSlugs, MUNICIPALITY_SLUG } from "@/lib/queries";

export const revalidate = 300;

type Props = { params: Promise<{ municipality: string }> };

export async function generateStaticParams() {
  // Static and database-free: this page works on the preview before
  // migrations 24–28 exist. Huntsville redirects to /races (see below).
  return MUNICIPALITIES.map((m) => ({ municipality: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipality: slug } = await params;
  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) return { title: "Municipality not found" };
  return {
    title: `${muni.name} 2026 — races and candidates`,
    description: `Who's running in ${muni.name} in the 2026 election: every race and candidate on the ballot.`,
  };
}

/** Display groups, in ballot order. Both council types share one group. */
const GROUPS: { key: string; label: string; types: string[] }[] = [
  { key: "mayor", label: "Mayor", types: ["mayor"] },
  { key: "council", label: "Council", types: ["council_at_large", "council_ward"] },
  { key: "school_board", label: "School board", types: ["school_board"] },
  {
    key: "provincial",
    label: "Provincial district",
    types: ["provincial_district"],
  },
];

/** A malformed source URL must never 500 the page. */
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
            <span className="pill bg-accent-light text-accent">
              Candidate positions loaded
            </span>
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
                  {c.name}
                  <span aria-hidden="true" className="ml-0.5 text-xs">
                    ↗
                  </span>
                  <span className="sr-only">
                    {" "}
                    — {c.name}&rsquo;s campaign website, opens in a new tab
                  </span>
                </a>
              ) : (
                <span className="text-ink">{c.name}</span>
              )}
              {c.party && (
                <span className="text-ink-faint"> · {c.party}</span>
              )}
              {c.acclaimed && (
                <span className="ml-1 text-xs font-medium text-flag">
                  Acclaimed
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

export default async function MunicipalityPage({ params }: Props) {
  const { municipality: slug } = await params;

  // Huntsville's canonical pages are /races/* — unprefixed slugs, unchanged
  // behaviour. This keeps one Huntsville races page instead of two.
  if (slug === MUNICIPALITY_SLUG) redirect("/races");

  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) notFound();

  const races = RACES_BY_MUNICIPALITY[slug] ?? [];

  // Which races already have database rows (positions imported). If the
  // check fails — preview before migration, a blip, a missing table — the
  // page renders without the tags rather than mislabelling anything.
  const loadedSlugs = await getExistingRaceSlugs(races.map((r) => r.slug));

  const groups = GROUPS.map((g) => ({
    ...g,
    races: races.filter((r) => g.types.includes(r.raceType)),
  })).filter((g) => g.races.length > 0);

  return (
    <div>
      <p className="text-sm">
        <Link href="/" className="link">
          &larr; Find your municipality
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{muni.name}</h1>
        {/* Honest coverage badge: this is the listings tier. */}
        <span className="pill bg-flag-light text-flag">Partial coverage</span>
      </div>
      <p className="prose-civic mt-3 text-sm">
        {muni.province === "BC"
          ? `The 93 electoral districts of the 2026 British Columbia provincial election. This page lists who's running in each district; full side-by-side positions are being researched.`
          : `Who's running in the 2026 municipal election. This page lists every race and candidate we know of; full side-by-side positions are being researched.`}
      </p>

      {races.length === 0 ? (
        <div className="mt-6">
          <UnavailableNotice what={`Race information for ${muni.name}`} />
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} aria-labelledby={`group-${g.key}`} className="mt-10">
            <h2 id={`group-${g.key}`} className="mb-4 text-xl">
              {g.label}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {g.races.map((race) => (
                <RaceEntry
                  key={race.slug}
                  race={race}
                  dataLoaded={
                    loadedSlugs === null ? null : loadedSlugs.has(race.slug)
                  }
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <p className="mt-10 text-sm text-ink-faint">
        {muni.candidateCount !== null
          ? `${muni.candidateCount} candidates across ${muni.raceCount} races, from official candidate lists. `
          : ""}
        Races with full position data link through to side-by-side comparisons
        once their data is imported; until then the race pages show what the
        database holds.
      </p>
    </div>
  );
}

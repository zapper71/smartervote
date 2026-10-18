import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import MunicipalityRaceList, { type MunicipalityRaceGroup } from "@/components/MunicipalityRaceList";
import {
  MUNICIPALITIES,
  RACES_BY_MUNICIPALITY,
  type ExpansionRace,
} from "@/lib/expansion-index";
import { getRaceSlugsWithPublishedPositions, MUNICIPALITY_SLUG } from "@/lib/queries";

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

export default async function MunicipalityPage({ params }: Props) {
  const { municipality: slug } = await params;

  // Huntsville's canonical pages are /races/* — unprefixed slugs, unchanged
  // behaviour. This keeps one Huntsville races page instead of two.
  if (slug === MUNICIPALITY_SLUG) redirect("/races");

  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) notFound();

  const races = RACES_BY_MUNICIPALITY[slug] ?? [];

  // Which races have at least one PUBLISHED position. If the check fails —
  // preview before migration, a blip, a missing table — the page renders
  // without the tags rather than mislabelling anything.
  const loadedSlugs = await getRaceSlugsWithPublishedPositions(
    races.map((r) => r.slug)
  );

  const groups = GROUPS.map((g) => ({
    ...g,
    races: races.filter((r) => g.types.includes(r.raceType)),
  })).filter((g) => g.races.length > 0);

  // Plain data for the client race-selection step: which races have published
  // positions (compare link) vs listing-only. Race cards are rendered
  // client-side so the list can be filtered.
  const raceGroups: MunicipalityRaceGroup[] = groups.map((g) => ({
    key: g.key,
    label: g.label,
    races: g.races.map((race) => ({
      race,
      dataLoaded: loadedSlugs === null ? null : loadedSlugs.has(race.slug),
    })),
  }));

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
        <MunicipalityRaceList groups={raceGroups} />
      )}

      <p className="mt-10 text-sm text-ink-faint">
        {muni.candidateCount !== null
          ? `${muni.candidateCount} candidates across ${muni.raceCount} races, from official candidate lists. `
          : ""}
        Races with published positions link straight to a side-by-side
        comparison from here; the rest show the candidate list until their
        positions are researched and imported.
      </p>
    </div>
  );
}

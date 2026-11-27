import Link from "next/link";
import { notFound } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import MunicipalityRaceList, { type MunicipalityRaceGroup } from "@/components/MunicipalityRaceList";
import {
  MUNICIPALITIES,
  RACES_BY_MUNICIPALITY,
} from "@/lib/expansion-index";
import { getRaceSlugsWithPublishedPositions } from "@/lib/queries";
import { finderFor } from "@/lib/tracked-elections";
import { localizePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ municipality: string }>; locale: Locale };

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
  {
    key: "federal",
    label: "Federal riding",
    types: ["federal_riding"],
  },
];

/** Province code (as stored on index municipalities) → province page slug.
 * ON, BC, SK and QC occur in MUNICIPALITIES today; extend when a new
 * province's municipalities go live. */
const PROVINCE_SLUGS: Record<string, string> = {
  ON: "ontario",
  BC: "british-columbia",
  SK: "saskatchewan",
  QC: "quebec",
};

/**
 * Municipality page body, shared by the English route and the /fr wrapper.
 * Static and database-free except the published-positions check (which
 * degrades to no tags on failure). Race/candidate names are index data and
 * stay in their native language in Phase 1, so there is no translations
 * fetch and no footnote here.
 */
export default async function MunicipalityPage({ params, locale }: Props) {
  const { municipality: slug } = await params;

  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) notFound();

  const races = RACES_BY_MUNICIPALITY[slug] ?? [];
  const isFederal = races.some((r) => r.raceType === "federal_riding");

  // Back link goes to the search page this municipality belongs to, not
  // home: the province's finder when one exists for this level (ON/SK
  // municipal, BC provincial, federal ridings in ON/QC/SK), else the
  // province overview. It never points at the province list again.
  const provinceSlug = PROVINCE_SLUGS[muni.province];
  const finderLevel = isFederal
    ? "federal"
    : muni.province === "BC"
      ? "provincial"
      : "municipal";
  const backHref =
    provinceSlug && finderFor(provinceSlug, finderLevel)
      ? localizePath(`/provinces/${provinceSlug}/finder?level=${finderLevel}`, locale)
      : provinceSlug
        ? localizePath(`/provinces/${provinceSlug}`, locale)
        : localizePath("/", locale);

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
        <Link href={backHref} className="link">
          &larr; Find your{" "}
          {isFederal
            ? "riding"
            : muni.province === "BC"
              ? "district"
              : "municipality"}
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{muni.name}</h1>
        {/* Honest coverage badge: this is the listings tier. */}
        <span className="pill bg-flag-light text-flag">Partial coverage</span>
      </div>
      <p className="prose-civic mt-3 text-sm">
        {isFederal
          ? `The December 7, 2026 federal byelection. This page lists every candidate running in this riding; full side-by-side positions are being researched.`
          : muni.province === "BC"
            ? `The 93 electoral districts of the 2026 British Columbia provincial election. This page lists who's running in each district; full side-by-side positions are being researched.`
            : `Who's running in the 2026 municipal election. This page lists every race and candidate we know of; full side-by-side positions are being researched.`}
      </p>

      {races.length === 0 ? (
        <div className="mt-6">
          <UnavailableNotice what={`Race information for ${muni.name}`} />
        </div>
      ) : (
        <MunicipalityRaceList groups={raceGroups} locale={locale} />
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

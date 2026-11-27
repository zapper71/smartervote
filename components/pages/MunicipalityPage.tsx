import Link from "next/link";
import { notFound } from "next/navigation";
import UnavailableNotice from "@/components/UnavailableNotice";
import MunicipalityRaceList, { type MunicipalityRaceGroup } from "@/components/MunicipalityRaceList";
import {
  MUNICIPALITIES,
  RACES_BY_MUNICIPALITY,
} from "@/lib/expansion-index";
import { getRaceSlugsWithPublishedPositions, getUiStrings } from "@/lib/queries";
import { finderFor } from "@/lib/tracked-elections";
import { formatUi, localizePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ municipality: string }>; locale: Locale };

/** Display groups, in ballot order. Both council types share one group. */
const GROUPS: { key: string; labelKey: string; types: string[] }[] = [
  { key: "mayor", labelKey: "muni.group_mayor", types: ["mayor"] },
  { key: "council", labelKey: "muni.group_council", types: ["council_at_large", "council_ward"] },
  { key: "school_board", labelKey: "muni.group_school_board", types: ["school_board"] },
  {
    key: "provincial",
    labelKey: "muni.group_provincial",
    types: ["provincial_district"],
  },
  {
    key: "federal",
    labelKey: "muni.group_federal",
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
 * stay in their native language in Phase 1.
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

  const s = await getUiStrings(locale, {
    "muni.group_mayor": "Mayor",
    "muni.group_council": "Council",
    "muni.group_school_board": "School board",
    "muni.group_provincial": "Provincial district",
    "muni.group_federal": "Federal riding",
    "muni.partial": "Partial coverage",
    "muni.intro_bc":
      "The 93 electoral districts of the 2026 British Columbia provincial election. This page lists who’s running in each district; full side-by-side positions are being researched.",
    "muni.intro_municipal":
      "Who’s running in the 2026 municipal election. This page lists every race and candidate we know of; full side-by-side positions are being researched.",
    "muni.intro_federal":
      "The December 7, 2026 federal byelection. This page lists every candidate running in this riding; full side-by-side positions are being researched.",
    "muni.footer_counts":
      "{candidates} candidates across {races} races, from official candidate lists.",
    "muni.footer_positions":
      "Races with published positions link straight to a side-by-side comparison from here; the rest show the candidate list until their positions are researched and imported.",
    "finder.find_riding": "Find your riding",
    "finder.find_district": "Find your district",
    "finder.find_municipality": "Find your municipality",
    "notice.unavailable_title": "{what} isn’t available right now",
    "notice.what_race_info": "Race information for {name}",
    "notice.body":
      "Something went wrong loading this page. It’s a problem on our end, not yours. For official candidate and voting information, go straight to the official source for your election — the authority running it.",
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
  });

  const groups = GROUPS.map((g) => ({
    key: g.key,
    label: s[g.labelKey],
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

  const findKey = isFederal
    ? "finder.find_riding"
    : muni.province === "BC"
      ? "finder.find_district"
      : "finder.find_municipality";

  return (
    <div>
      <p className="text-sm">
        <Link href={backHref} className="link">
          &larr; {s[findKey]}
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{muni.name}</h1>
        {/* Honest coverage badge: this is the listings tier. */}
        <span className="pill bg-flag-light text-flag">{s["muni.partial"]}</span>
      </div>
      <p className="prose-civic mt-3 text-sm">
        {isFederal
          ? s["muni.intro_federal"]
          : muni.province === "BC"
            ? s["muni.intro_bc"]
            : s["muni.intro_municipal"]}
      </p>

      {races.length === 0 ? (
        <div className="mt-6">
          <UnavailableNotice
            what={formatUi(s["notice.what_race_info"], { name: muni.name })}
            locale={locale}
            strings={s}
          />
        </div>
      ) : (
        <MunicipalityRaceList groups={raceGroups} locale={locale} strings={s} />
      )}

      <p className="mt-10 text-sm text-ink-faint">
        {muni.candidateCount !== null && muni.raceCount !== null
          ? `${formatUi(s["muni.footer_counts"], {
              candidates: muni.candidateCount,
              races: muni.raceCount,
            })} `
          : ""}
        {s["muni.footer_positions"]}
      </p>
    </div>
  );
}

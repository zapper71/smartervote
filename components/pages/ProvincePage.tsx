import Link from "next/link";
import { notFound } from "next/navigation";
import PastRacesDropdown from "@/components/PastRacesDropdown";
import {
  finderFor,
  getProvince,
  provinceTiles,
  type TileRow,
  type TileSection,
} from "@/lib/tracked-elections";
import { getUiStrings } from "@/lib/queries";
import { formatUi, localizePath, type Locale } from "@/lib/i18n";
import { PROVINCE_NAME_KEYS } from "@/components/pages/chrome";

type Props = { params: Promise<{ province: string }>; locale: Locale };

function RaceRow({ row }: { row: TileRow }) {
  return (
    <p className="mt-2 text-ink-soft">
      {row.label ? `${row.label} — ${row.date}` : row.date}
    </p>
  );
}

/** finder.entity_* key for the entity a finder link opens. */
const ENTITY_KEYS = {
  municipality: "finder.entity_municipality",
  district: "finder.entity_district",
  riding: "finder.entity_riding",
} as const;

/**
 * One column (Federal, Provincial, or Municipal): a stack of separate
 * tiles in order — one tile per current race, then one tile per next
 * race, then the past races as a drop-down when at least one exists,
 * otherwise the historical-loading disclaimer.
 *
 * Tiles open the dedicated finder page, not an inline section: current
 * race tiles are links to /provinces/<slug>/finder?level=<level> when
 * that province/level has finder data, and past race tiles carry a
 * finder link below the drop-down (the drop-down itself cannot live
 * inside a link). Next race tiles are never clickable — there is nothing
 * to select for an election years out. A separate page keeps the search
 * unmissable on phones, where an inline reveal below the tiles is easy
 * to miss entirely.
 */
function Column({
  title,
  section,
  level,
  provinceSlug,
  locale,
  strings,
}: {
  title: string;
  section: TileSection;
  level: "federal" | "provincial" | "municipal";
  provinceSlug: string;
  locale: Locale;
  strings: Record<string, string>;
}) {
  const finder = finderFor(provinceSlug, level);
  const finderHref = finder
    ? localizePath(`/provinces/${provinceSlug}/finder?level=${level}`, locale)
    : null;
  const finderText = finder
    ? formatUi(strings["province.find_your"], {
        entity: strings[ENTITY_KEYS[finder.entity]],
      })
    : null;
  return (
    <div>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-3">
        {section.current.map((row, i) => {
          const inner = (
            <>
              <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
                {strings["province.current"]}
              </h3>
              <RaceRow row={row} />
              {finderText && (
                <span className="mt-3 block text-sm text-accent">
                  {finderText}
                </span>
              )}
            </>
          );
          return finderHref ? (
            <Link
              key={`current-${i}`}
              href={finderHref}
              className="card block no-underline hover:border-accent"
            >
              {inner}
            </Link>
          ) : (
            <section key={`current-${i}`} className="card">
              {inner}
            </section>
          );
        })}
        {section.next.map((row, i) => (
          <section key={`next-${i}`} className="card">
            <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
              {strings["province.next"]}
            </h3>
            <RaceRow row={row} />
          </section>
        ))}
        {section.past.length > 0 ? (
          <section className="card">
            <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
              {strings["province.past"]}
            </h3>
            <PastRacesDropdown races={section.past} />
            {finderHref && finderText && (
              <Link
                href={finderHref}
                className="link mt-3 inline-block text-sm"
              >
                {finderText}
              </Link>
            )}
          </section>
        ) : (
          <p className="text-sm text-ink-faint">
            {strings["province.historical_soon"]}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Province page body, shared by the English route and the /fr wrapper.
 * The current/next/past sections depend on today's date, so this page
 * renders per request, never frozen at build time — the route files keep
 * `dynamic = "force-dynamic"`. No database content renders here, so there
 * is no translations fetch and no footnote.
 */
export default async function ProvincePage({ params, locale }: Props) {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();

  const s = await getUiStrings(locale, {
    "upcoming.meta_title": "Recent & Upcoming Elections",
    "province.current": "Current Race",
    "province.next": "Next Race",
    "province.past": "Past Races",
    "province.find_your": "Find your {entity} →",
    "province.historical_soon": "We will load historical race data soon.",
    "province.col_federal": "Federal",
    "province.col_provincial": "Provincial",
    "province.col_municipal": "Municipal",
    "finder.entity_municipality": "municipality",
    "finder.entity_district": "district",
    "finder.entity_riding": "riding",
    "elections.not_tracked": "Not yet tracked",
    "elections.scheduled": "(scheduled)",
    "elections.level_federal_byelections": "Federal byelections",
    "elections.tile_resort_munis": "Resort municipalities",
    "elections.tile_most_munis": "Most municipalities",
    "elections.tile_all_except_resort": "All except Resort Municipality",
    "elections.tile_resort_muni": "Resort Municipality",
    "elections.tile_rm_even": "RM even-division councillors",
    "elections.tile_rm_odd": "RM odd divisions + reeve",
    "elections.tile_cities": "Cities, towns and villages",
    "elections.tile_resort_villages": "Resort villages",
    "elections.tile_northern": "Northern municipalities",
    "elections.tile_hamlets": "Hamlets",
    "elections.tile_fort_good_hope": "Fort Good Hope (charter community)",
    "elections.tile_tlicho": "Tłįcho community governments",
    "elections.tile_yellowknife": "City of Yellowknife",
    "finder.province_ontario": "Ontario",
    "finder.province_bc": "British Columbia",
    "finder.province_sk": "Saskatchewan",
    "finder.province_qc": "Quebec",
    "elections.province_alberta": "Alberta",
    "elections.province_manitoba": "Manitoba",
    "elections.province_nb": "New Brunswick",
    "elections.province_nl": "Newfoundland and Labrador",
    "elections.province_ns": "Nova Scotia",
    "elections.province_nwt": "Northwest Territories",
    "elections.province_nunavut": "Nunavut",
    "elections.province_pei": "Prince Edward Island",
    "elections.province_yukon": "Yukon",
  });
  // Tile labels are English data literals in lib/tracked-elections.ts;
  // the map below localises them through the elections.tile_* rows.
  // "Federal byelections" has no tile row — the level row carries the
  // same text in both languages.
  const tiles = provinceTiles(slug, new Date(), {
    locale,
    notTracked: s["elections.not_tracked"],
    scheduled: s["elections.scheduled"],
    labels: {
      "Federal byelections": s["elections.level_federal_byelections"],
      "Resort municipalities": s["elections.tile_resort_munis"],
      "Most municipalities": s["elections.tile_most_munis"],
      "All except Resort Municipality": s["elections.tile_all_except_resort"],
      "Resort Municipality": s["elections.tile_resort_muni"],
      "RM even-division councillors": s["elections.tile_rm_even"],
      "RM odd divisions + reeve": s["elections.tile_rm_odd"],
      "Cities, towns and villages": s["elections.tile_cities"],
      "Resort villages": s["elections.tile_resort_villages"],
      "Northern municipalities": s["elections.tile_northern"],
      Hamlets: s["elections.tile_hamlets"],
      "Fort Good Hope (charter community)": s["elections.tile_fort_good_hope"],
      "Tłįcho community governments": s["elections.tile_tlicho"],
      "City of Yellowknife": s["elections.tile_yellowknife"],
    },
  });

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">
        {PROVINCE_NAME_KEYS[slug] ? s[PROVINCE_NAME_KEYS[slug]] : province.name}
      </h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href={localizePath("/upcoming", locale)} className="link">
          {s["upcoming.meta_title"]}
        </Link>
      </p>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-3">
        <Column
          title={s["province.col_federal"]}
          section={tiles.federal}
          level="federal"
          provinceSlug={slug}
          locale={locale}
          strings={s}
        />
        <Column
          title={s["province.col_provincial"]}
          section={tiles.provincial}
          level="provincial"
          provinceSlug={slug}
          locale={locale}
          strings={s}
        />
        <Column
          title={s["province.col_municipal"]}
          section={tiles.municipal}
          level="municipal"
          provinceSlug={slug}
          locale={locale}
          strings={s}
        />
      </div>
    </div>
  );
}

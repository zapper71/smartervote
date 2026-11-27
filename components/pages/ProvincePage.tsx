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
import { localizePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ province: string }>; locale: Locale };

function RaceRow({ row }: { row: TileRow }) {
  return (
    <p className="mt-2 text-ink-soft">
      {row.label ? `${row.label} — ${row.date}` : row.date}
    </p>
  );
}

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
}: {
  title: string;
  section: TileSection;
  level: "federal" | "provincial" | "municipal";
  provinceSlug: string;
  locale: Locale;
}) {
  const finder = finderFor(provinceSlug, level);
  const finderHref = finder
    ? localizePath(`/provinces/${provinceSlug}/finder?level=${level}`, locale)
    : null;
  const finderText = finder ? `Find your ${finder.entity} →` : null;
  return (
    <div>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-3">
        {section.current.map((row, i) => {
          const inner = (
            <>
              <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
                Current Race
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
              Next Race
            </h3>
            <RaceRow row={row} />
          </section>
        ))}
        {section.past.length > 0 ? (
          <section className="card">
            <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
              Past Races
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
            We will load historical race data soon.
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

  const tiles = provinceTiles(slug);

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{province.name}</h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href={localizePath("/upcoming", locale)} className="link">
          Recent &amp; Upcoming Elections
        </Link>
      </p>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-3">
        <Column
          title="Federal"
          section={tiles.federal}
          level="federal"
          provinceSlug={slug}
          locale={locale}
        />
        <Column
          title="Provincial"
          section={tiles.provincial}
          level="provincial"
          provinceSlug={slug}
          locale={locale}
        />
        <Column
          title="Municipal"
          section={tiles.municipal}
          level="municipal"
          provinceSlug={slug}
          locale={locale}
        />
      </div>
    </div>
  );
}

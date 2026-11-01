import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import PastRacesDropdown from "@/components/PastRacesDropdown";
import {
  getProvince,
  provinceTiles,
  type TileRow,
  type TileSection,
} from "@/lib/tracked-elections";

// The current/next/past sections depend on today's date (filing deadline
// passed, one month after all results official), so province pages must
// render per request, never freeze at build time. That is why there is no
// generateStaticParams here: static prerendering would pin the sections to
// the build date and the transitions would never happen until a redeploy.
// Per-request rendering is also what lets ?finder=<level> reveal the
// finder section (see Column) without a rebuild.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ province: string }>;
  searchParams?: Promise<{ finder?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found" };
  return {
    title: `${province.name} elections`,
    description: `Federal, provincial and municipal elections tracked by SmarterVote in ${province.name}.`,
  };
}

function RaceRow({ row }: { row: TileRow }) {
  return (
    <p className="mt-2 text-ink-soft">
      {row.label ? `${row.label} — ${row.date}` : row.date}
    </p>
  );
}

/**
 * Which finder, if any, a province page's tile can open. Finder data
 * covers Ontario municipalities and BC electoral districts only — every
 * other province/level has no finder to open, so its tiles stay plain.
 * See docs/finder-terminology.md for the level language used here.
 */
function finderFor(
  provinceSlug: string,
  level: "federal" | "provincial" | "municipal",
): { initialProvince: "ON" | "BC"; entity: "municipality" | "district" } | null {
  if (provinceSlug === "ontario" && level === "municipal") {
    return { initialProvince: "ON", entity: "municipality" };
  }
  if (provinceSlug === "british-columbia" && level === "provincial") {
    return { initialProvince: "BC", entity: "district" };
  }
  return null;
}

/**
 * One column (Federal, Provincial, or Municipal): a stack of separate
 * tiles in order — one tile per current race, then one tile per next
 * race, then the past races as a drop-down when at least one exists,
 * otherwise the historical-loading disclaimer.
 *
 * The finder stays hidden until a tile opens it: current race tiles are
 * links to ?finder=<level> when that province/level has finder data, and
 * past race tiles carry a finder link below the drop-down (the drop-down
 * itself cannot live inside a link). Next race tiles are never clickable
 * — there is nothing to select for an election years out.
 */
function Column({
  title,
  section,
  level,
  provinceSlug,
}: {
  title: string;
  section: TileSection;
  level: "federal" | "provincial" | "municipal";
  provinceSlug: string;
}) {
  const finder = finderFor(provinceSlug, level);
  const finderHref = finder
    ? `/provinces/${provinceSlug}?finder=${level}`
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

export default async function ProvincePage({ params, searchParams }: Props) {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();

  const tiles = provinceTiles(slug);
  const sp = await searchParams;
  const finderParam = typeof sp?.finder === "string" ? sp.finder : undefined;
  const finderOpen =
    finderParam === "federal" ||
    finderParam === "provincial" ||
    finderParam === "municipal"
      ? finderFor(slug, finderParam)
      : null;

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{province.name}</h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href="/upcoming" className="link">
          Upcoming elections
        </Link>
      </p>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-3">
        <Column
          title="Federal"
          section={tiles.federal}
          level="federal"
          provinceSlug={slug}
        />
        <Column
          title="Provincial"
          section={tiles.provincial}
          level="provincial"
          provinceSlug={slug}
        />
        <Column
          title="Municipal"
          section={tiles.municipal}
          level="municipal"
          provinceSlug={slug}
        />
      </div>

      {finderOpen && (
        <section className="mt-8">
          <p className="text-sm text-ink-faint">
            <Link href={`/provinces/${slug}`} className="link">
              ← Back to {province.name} overview
            </Link>
          </p>
          <MunicipalityFinder initialProvince={finderOpen.initialProvince} />
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import PastRacesDropdown from "@/components/PastRacesDropdown";
import {
  getProvince,
  hasFinderEntries,
  provinceTiles,
  type TileRow,
  type TileSection,
} from "@/lib/tracked-elections";

// The current/next/past sections depend on today's date (filing deadline
// passed, one month after all results official), so province pages must
// render per request, never freeze at build time. That is why there is no
// generateStaticParams here: static prerendering would pin the sections to
// the build date and the transitions would never happen until a redeploy.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ province: string }> };

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
 * One column (Federal, Provincial, or Municipal): a stack of separate
 * tiles in order — one tile per current race, then one tile per next
 * race, then the past races as a drop-down when at least one exists,
 * otherwise the historical-loading disclaimer.
 */
function Column({
  title,
  section,
}: {
  title: string;
  section: TileSection;
}) {
  return (
    <div>
      <h2 className="text-xl">{title}</h2>
      <div className="mt-3 space-y-3">
        {section.current.map((row, i) => (
          <section key={`current-${i}`} className="card">
            <h3 className="text-sm font-medium uppercase tracking-wide text-accent">
              Current Race
            </h3>
            <RaceRow row={row} />
          </section>
        ))}
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

export default async function ProvincePage({ params }: Props) {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();

  const tiles = provinceTiles(slug);
  const showFinder = hasFinderEntries(slug);

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{province.name}</h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href="/upcoming" className="link">
          Upcoming elections
        </Link>
      </p>

      <div className="mt-6 grid items-start gap-4 md:grid-cols-3">
        <Column title="Federal" section={tiles.federal} />
        <Column title="Provincial" section={tiles.provincial} />
        <Column title="Municipal" section={tiles.municipal} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl">Find your municipality or district</h2>
        {showFinder && province.short ? (
          <MunicipalityFinder initialProvince={province.short} />
        ) : (
          <p className="prose-civic mt-4">Coming soon</p>
        )}
      </section>
    </div>
  );
}

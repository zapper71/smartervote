import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import {
  PROVINCES,
  getProvince,
  hasFinderEntries,
  provinceTiles,
  type TileRow,
} from "@/lib/tracked-elections";

type Props = { params: Promise<{ province: string }> };

export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ province: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found" };
  return {
    title: `${province.name} elections`,
    description: `Federal, provincial and municipal elections tracked by SmarterVote in ${province.name}.`,
  };
}

function Tile({
  title,
  rows,
}: {
  title: string;
  rows: TileRow[];
}) {
  return (
    <section className="card">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-3 text-sm font-medium uppercase tracking-wide text-ink-faint">
        Next election
      </p>
      <ul className="mt-2 space-y-1">
        {rows.map((row, i) => (
          <li key={i} className="text-ink-soft">
            {row.label ? `${row.label} — ${row.date}` : row.date}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-paper-edge pt-3 text-sm text-ink-faint">
        We will load historical race data soon.
      </p>
    </section>
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

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Tile title="Federal" rows={tiles.federal} />
        <Tile title="Provincial" rows={tiles.provincial} />
        <Tile title="Municipal" rows={tiles.municipal} />
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

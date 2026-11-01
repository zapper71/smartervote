import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import { finderFor, getProvince } from "@/lib/tracked-elections";

// A dedicated page, not an inline reveal: on a phone an inline finder
// below the tiles is easy to miss entirely, while this page makes the
// search the whole point of the screen. The ?level= value comes from the
// tile that linked here and sets the finder's language (municipality vs
// district); reading it opts this route into per-request rendering.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ province: string }>;
  searchParams?: Promise<{ level?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found" };
  return {
    title: `Find your municipality or district · ${province.name}`,
    description: `Find your municipality or district in ${province.name}.`,
  };
}

export default async function FinderPage({ params, searchParams }: Props) {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();

  const sp = await searchParams;
  const levelParam = typeof sp?.level === "string" ? sp.level : undefined;
  const finder =
    levelParam === "federal" ||
    levelParam === "provincial" ||
    levelParam === "municipal"
      ? finderFor(slug, levelParam)
      : null;

  const backHref = `/provinces/${slug}`;

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{province.name}</h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href={backHref} className="link">
          ← Back to {province.name} overview
        </Link>
      </p>

      {finder ? (
        <MunicipalityFinder
          initialProvince={finder.initialProvince}
          autoFocus
        />
      ) : (
        <p className="mt-6 text-ink-soft">
          There&rsquo;s no finder for this yet.{" "}
          <Link href={backHref} className="link">
            Back to {province.name} overview
          </Link>
          .
        </p>
      )}
    </div>
  );
}

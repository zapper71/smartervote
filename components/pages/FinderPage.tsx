import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import { finderFor, getProvince } from "@/lib/tracked-elections";
import { localizePath, type Locale } from "@/lib/i18n";

type Props = {
  params: Promise<{ province: string }>;
  searchParams?: Promise<{ level?: string | string[] }>;
  locale: Locale;
};

/**
 * Finder page body, shared by the English route and the /fr wrapper.
 * Reading searchParams opts this route into per-request rendering, as
 * before. No database content renders here, so there is no translations
 * fetch and no footnote.
 */
export default async function FinderPage({ params, searchParams, locale }: Props) {
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

  const backHref = localizePath(`/provinces/${slug}`, locale);

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
          entity={finder.entity}
          autoFocus
          locale={locale}
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

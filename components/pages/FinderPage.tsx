import Link from "next/link";
import { notFound } from "next/navigation";
import MunicipalityFinder from "@/components/MunicipalityFinder";
import { finderFor, getProvince } from "@/lib/tracked-elections";
import { getUiStrings } from "@/lib/queries";
import { formatUi, localizePath, type Locale } from "@/lib/i18n";
import { PROVINCE_NAME_KEYS } from "@/components/pages/chrome";

type Props = {
  params: Promise<{ province: string }>;
  searchParams?: Promise<{ level?: string | string[] }>;
  locale: Locale;
};

/**
 * Finder page body, shared by the English route and the /fr wrapper.
 * Reading searchParams opts this route into per-request rendering, as
 * before. No database content renders here, so there is no translations
 * fetch and no footnote. The no-finder link reuses finder.back_overview
 * with its leading "← " stripped — there is no separate row for the
 * arrow-less text.
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
  const s = await getUiStrings(locale, {
    "finder.back_overview": "← Back to {province} overview",
    "finder.none_yet": "There’s no finder for this yet.",
    "finder.find_municipality": "Find your municipality",
    "finder.find_district": "Find your district",
    "finder.find_riding": "Find your riding",
    "finder.placeholder_on": "e.g. Toronto, Ottawa, Muskoka Lakes…",
    "finder.placeholder_sk": "e.g. Corman Park, Edenwold…",
    "finder.placeholder_bc": "e.g. Abbotsford South, Victoria…",
    "finder.placeholder_riding_on":
      "e.g. Scarborough North, Brantford–Brant South…",
    "finder.placeholder_riding_sk": "e.g. Yorkton–Melville…",
    "finder.placeholder_riding_qc": "e.g. Laurier–Sainte-Marie, Rosemont…",
    "finder.hint_bc":
      "{count} BC districts · scroll the list or type to filter",
    "finder.hint_riding":
      "{count} {province} riding(s) · scroll the list or type to filter",
    "finder.hint_on":
      "{count} Ontario municipalities and ridings · scroll the list or type to filter — wards & communities work too (e.g. Etobicoke, New Hamburg)",
    "finder.hint_sk":
      "{count} Saskatchewan municipalities and ridings · scroll the list or type to filter",
    "finder.hint_qc":
      "{count} Quebec ridings · scroll the list or type to filter",
    "finder.no_match":
      "No {plural} match “{query}”. Check the spelling, or try a nearby place.",
    "finder.plural_districts": "districts",
    "finder.plural_municipalities": "municipalities",
    "finder.plural_ridings": "ridings",
    "finder.includes": "Includes {places}",
    "finder.ward_race": "{name} · ward race",
    "finder.showing":
      "Showing {shown} of {total} — keep typing to narrow it down.",
    "finder.province_ontario": "Ontario",
    "finder.province_bc": "British Columbia",
    "finder.province_sk": "Saskatchewan",
    "finder.province_qc": "Quebec",
  });
  const provinceName = PROVINCE_NAME_KEYS[slug]
    ? s[PROVINCE_NAME_KEYS[slug]]
    : province.name;
  const backLabel = formatUi(s["finder.back_overview"], {
    province: provinceName,
  });

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl">{provinceName}</h1>
      <p className="mt-4 text-sm text-ink-faint">
        <Link href={backHref} className="link">
          {backLabel}
        </Link>
      </p>

      {finder ? (
        <MunicipalityFinder
          initialProvince={finder.initialProvince}
          entity={finder.entity}
          autoFocus
          locale={locale}
          strings={s}
        />
      ) : (
        <p className="mt-6 text-ink-soft">
          {s["finder.none_yet"]}{" "}
          <Link href={backHref} className="link">
            {backLabel.replace(/^← /, "")}
          </Link>
          .
        </p>
      )}
    </div>
  );
}

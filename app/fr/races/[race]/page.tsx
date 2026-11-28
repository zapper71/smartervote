import type { Metadata } from "next";
import { localizeRaceName } from "@/lib/i18n";
import RacePage from "@/components/pages/RacePage";
import {
  getRaceBySlugGlobal,
  getRaces,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = { params: Promise<{ race: string }> };

export async function generateStaticParams() {
  try {
    const races = await getRaces();
    return races.map((r) => ({ race: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race: slug } = await params;
  const found = await getRaceBySlugGlobal(slug);
  if (!found) return { title: "Course introuvable" };
  const { race, municipality } = found;
  // Same place fragments as the inventory's race.meta_place_* rows, so the
  // French description matches the ui_string seed exactly.
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "à l'élection municipale de 2026 de la ville de Huntsville"
      : `à l'élection de 2026 à ${municipality?.name ?? "Huntsville"}`;
  return {
    title: localizeRaceName(race.name, "fr"),
    description:
      race.description ?? `Candidats pour ${localizeRaceName(race.name, "fr")} ${place}.`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function RaceFr({ params }: Props) {
  return <RacePage params={params} locale="fr" />;
}

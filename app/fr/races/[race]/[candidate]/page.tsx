import type { Metadata } from "next";
import { localizeRaceName } from "@/lib/i18n";
import CandidatePage from "@/components/pages/CandidatePage";
import {
  getCandidate,
  getCandidatesForRace,
  getRaceBySlugGlobal,
  getRaces,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = { params: Promise<{ race: string; candidate: string }> };

export async function generateStaticParams() {
  try {
    const races = await getRaces();
    const out: { race: string; candidate: string }[] = [];
    for (const race of races) {
      const candidates = await getCandidatesForRace(race.id);
      for (const c of candidates) out.push({ race: race.slug, candidate: c.slug });
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { race, candidate } = await params;
  const result = await getCandidate(race, candidate);
  if (!result) return { title: "Candidat introuvable" };
  const found = await getRaceBySlugGlobal(race);
  const municipality = found?.municipality;
  const place =
    !municipality || municipality.slug === MUNICIPALITY_SLUG
      ? "à l'élection municipale de 2026 de la ville de Huntsville"
      : `à l'élection de 2026 à ${municipality.name}`;
  return {
    title: `${result.candidate.name} — ${localizeRaceName(result.race.name, "fr")}`,
    description: `Les positions de ${result.candidate.name} sur les enjeux ${place}, avec une source pour chaque affirmation.`,
    alternates: pageAlternates(`/races/${race}/${candidate}`),
  };
}

export default function CandidateFr({ params }: Props) {
  return <CandidatePage params={params} locale="fr" />;
}

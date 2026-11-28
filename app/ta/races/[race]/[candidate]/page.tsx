import type { Metadata } from "next";
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
  if (!result) return { title: "வேட்பாளர் கிடைக்கவில்லை" };
  const found = await getRaceBySlugGlobal(race);
  const municipality = found?.municipality;
  const place =
    !municipality || municipality.slug === MUNICIPALITY_SLUG
      ? "ஹன்ட்ஸ்வில்லி நகரின் 2026 நகராட்சித் தேர்தல்"
      : `${municipality.name}-இன் 2026 தேர்தல்`;
  return {
    title: `${result.candidate.name} — ${result.race.name}`,
    description: `${result.candidate.name}-இன் நிலைப்பாடுகள் — ${place} பிரச்சினைகள். ஒவ்வொரு கூற்றுக்கும் மூலம் உண்டு.`,
    alternates: pageAlternates(`/races/${race}/${candidate}`),
  };
}

export default function CandidateTa({ params }: Props) {
  return <CandidatePage params={params} locale="ta" />;
}

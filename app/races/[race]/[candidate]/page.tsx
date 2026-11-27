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
  if (!result) return { title: "Candidate not found" };
  // The race's own municipality, not Huntsville by assumption. Huntsville
  // keeps its exact long-standing description.
  const found = await getRaceBySlugGlobal(race);
  const municipality = found?.municipality;
  const place =
    !municipality || municipality.slug === MUNICIPALITY_SLUG
      ? "the Town of Huntsville 2026 municipal election"
      : `the ${municipality.name} 2026 election`;
  return {
    title: `${result.candidate.name} — ${result.race.name}`,
    description: `Where ${result.candidate.name} stands on the issues in ${place}, with a source for every claim.`,
    alternates: pageAlternates(`/races/${race}/${candidate}`),
  };
}

export default function Candidate({ params }: Props) {
  return <CandidatePage params={params} locale="en" />;
}

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
  if (!result) return { title: "未找到該候選人" };
  const found = await getRaceBySlugGlobal(race);
  const municipality = found?.municipality;
  const place =
    !municipality || municipality.slug === MUNICIPALITY_SLUG
      ? "2026年亨茨維爾市市政選舉"
      : `2026年${municipality.name}選舉`;
  return {
    title: `${result.candidate.name} — ${result.race.name}`,
    description: `${result.candidate.name}就${place}各議題的立場，每項主張都有來源。`,
    alternates: pageAlternates(`/races/${race}/${candidate}`),
  };
}

export default function CandidateZhHant({ params }: Props) {
  return <CandidatePage params={params} locale="zh-Hant" />;
}

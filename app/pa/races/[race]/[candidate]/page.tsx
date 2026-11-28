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
  if (!result) return { title: "ਉਮੀਦਵਾਰ ਨਹੀਂ ਮਿਲਿਆ" };
  const found = await getRaceBySlugGlobal(race);
  const municipality = found?.municipality;
  const place =
    !municipality || municipality.slug === MUNICIPALITY_SLUG
      ? "ਹੰਟਸਵਿਲ ਸ਼ਹਿਰ ਦੀ 2026 ਨਗਰਪਾਲਿਕਾ ਚੋਣ"
      : `${municipality.name} ਦੀ 2026 ਚੋਣ`;
  return {
    title: `${result.candidate.name} — ${localizeRaceName(result.race.name, "pa")}`,
    description: `${result.candidate.name} ਦੇ ${place} ਦੇ ਮੁੱਦਿਆਂ ਬਾਰੇ ਨਜ਼ਰੀਏ, ਹਰ ਦਾਅਵੇ ਦੇ ਸਰੋਤ ਨਾਲ।`,
    alternates: pageAlternates(`/races/${race}/${candidate}`),
  };
}

export default function CandidatePa({ params }: Props) {
  return <CandidatePage params={params} locale="pa" />;
}

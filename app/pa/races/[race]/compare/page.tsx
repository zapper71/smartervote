import type { Metadata } from "next";
import ComparePage from "@/components/pages/ComparePage";
import {
  getIssues,
  getRaceBySlugGlobal,
  getRaces,
} from "@/lib/queries";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = {
  params: Promise<{ race: string }>;
  searchParams: Promise<{ only?: string | string[] }>;
};

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
  if (!found) return { title: "ਹਲਕਾ ਨਹੀਂ ਮਿਲਿਆ" };
  const { race } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0
      ? `ਉਹੀ ${issues.length} ਮੁੱਦੇ`
      : "ਉਹੀ ਦਸ ਮੁੱਦੇ";
  return {
    title: `ਉਮੀਦਵਾਰਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ — ${race.name}`,
    description: `${race.name} ਦੇ ਸਾਰੇ ਉਮੀਦਵਾਰ ${issuePhrase} 'ਤੇ ਨਾਲੋ ਨਾਲ, ਹਰ ਦਾਅਵੇ ਦੇ ਸਰੋਤ ਨਾਲ।`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function ComparePa({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="pa" />;
}

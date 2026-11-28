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
  if (!found) return { title: "未找到該選區" };
  const { race } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0
      ? `${issues.length} 個相同議題`
      : "十個相同議題";
  return {
    title: `比較候選人 — ${race.name}`,
    description: `所有${race.name}候選人就${issuePhrase}並排比較，每項主張都有來源。`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function CompareZhHant({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="zh-Hant" />;
}

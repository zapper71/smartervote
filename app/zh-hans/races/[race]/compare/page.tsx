import type { Metadata } from "next";
import { localizeRaceName } from "@/lib/i18n";
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
  if (!found) return { title: "未找到该选区" };
  const { race } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0
      ? `${issues.length} 个相同议题`
      : "十个相同议题";
  return {
    title: `比较候选人 — ${localizeRaceName(race.name, "zh-Hans")}`,
    description: `所有${localizeRaceName(race.name, "zh-Hans")}候选人就${issuePhrase}并排比较，每项主张都有来源。`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function CompareZhHans({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="zh-Hans" />;
}

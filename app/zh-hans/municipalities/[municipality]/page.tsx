import type { Metadata } from "next";
import MunicipalityPage from "@/components/pages/MunicipalityPage";
import { MUNICIPALITIES, RACES_BY_MUNICIPALITY } from "@/lib/expansion-index";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = { params: Promise<{ municipality: string }> };

export async function generateStaticParams() {
  return MUNICIPALITIES.map((m) => ({ municipality: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipality: slug } = await params;
  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) return { title: "未找到该市镇" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — 选区与候选人`,
    description: isFederal
      ? `参加${muni.name}2026年12月7日联邦补选的候选人：选票上的所有候选人。`
      : `参加${muni.name}2026年选举的候选人：选票上的所有选区和候选人。`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function MunicipalityZhHans({ params }: Props) {
  return <MunicipalityPage params={params} locale="zh-Hans" />;
}

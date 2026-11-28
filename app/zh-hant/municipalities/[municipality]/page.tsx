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
  if (!muni) return { title: "未找到該市鎮" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — 選區與候選人`,
    description: isFederal
      ? `參加${muni.name}2026年12月7日聯邦補選的候選人：選票上的所有候選人。`
      : `參加${muni.name}2026年選舉的候選人：選票上的所有選區和候選人。`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function MunicipalityZhHant({ params }: Props) {
  return <MunicipalityPage params={params} locale="zh-Hant" />;
}

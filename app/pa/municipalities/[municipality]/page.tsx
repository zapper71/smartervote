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
  if (!muni) return { title: "ਨਗਰਪਾਲਿਕਾ ਨਹੀਂ ਮਿਲੀ" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — ਹਲਕੇ ਅਤੇ ਉਮੀਦਵਾਰ`,
    description: isFederal
      ? `${muni.name} ਵਿੱਚ 7 ਦਸੰਬਰ 2026 ਦੀ ਸੰਘੀ ਉਪ-ਚੋਣ ਵਿੱਚ ਖੜ੍ਹੇ ਉਮੀਦਵਾਰ: ਬੈਲਟ 'ਤੇ ਸਾਰੇ ਉਮੀਦਵਾਰ।`
      : `${muni.name} ਵਿੱਚ 2026 ਦੀ ਚੋਣ ਵਿੱਚ ਖੜ੍ਹੇ ਉਮੀਦਵਾਰ: ਬੈਲਟ 'ਤੇ ਸਾਰੇ ਹਲਕੇ ਅਤੇ ਉਮੀਦਵਾਰ।`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function MunicipalityPa({ params }: Props) {
  return <MunicipalityPage params={params} locale="pa" />;
}

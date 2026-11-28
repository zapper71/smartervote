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
  if (!muni) return { title: "நகராட்சி கிடைக்கவில்லை" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — தொகுதிகளும் வேட்பாளர்களும்`,
    description: isFederal
      ? `${muni.name}-இல் 2026 டிசம்பர் 7 கூட்டாட்சி இடைத்தேர்தலில் போட்டியிடுபவர்கள்: வாக்குச்சீட்டில் உள்ள அனைத்து வேட்பாளர்களும்.`
      : `${muni.name}-இல் 2026 தேர்தலில் போட்டியிடுபவர்கள்: வாக்குச்சீட்டில் உள்ள அனைத்து தொகுதிகளும் வேட்பாளர்களும்.`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function MunicipalityTa({ params }: Props) {
  return <MunicipalityPage params={params} locale="ta" />;
}

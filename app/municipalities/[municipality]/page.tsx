import type { Metadata } from "next";
import MunicipalityPage from "@/components/pages/MunicipalityPage";
import { MUNICIPALITIES, RACES_BY_MUNICIPALITY } from "@/lib/expansion-index";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = { params: Promise<{ municipality: string }> };

export async function generateStaticParams() {
  // Static and database-free: this page works on the preview before
  // migrations 24–28 exist.
  return MUNICIPALITIES.map((m) => ({ municipality: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { municipality: slug } = await params;
  const muni = MUNICIPALITIES.find((m) => m.slug === slug);
  if (!muni) return { title: "Municipality not found" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — races and candidates`,
    description: isFederal
      ? `Who's running in ${muni.name} in the December 7, 2026 federal byelection: every candidate on the ballot.`
      : `Who's running in ${muni.name} in the 2026 election: every race and candidate on the ballot.`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function Municipality({ params }: Props) {
  return <MunicipalityPage params={params} locale="en" />;
}

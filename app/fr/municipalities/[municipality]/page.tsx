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
  if (!muni) return { title: "Municipalité introuvable" };
  const isFederal = (RACES_BY_MUNICIPALITY[slug] ?? []).some(
    (r) => r.raceType === "federal_riding"
  );
  return {
    title: `${muni.name} 2026 — courses et candidats`,
    description: isFederal
      ? `Qui se présente à ${muni.name} à l'élection partielle fédérale du 7 décembre 2026 : tous les candidats sur le bulletin de vote.`
      : `Qui se présente à ${muni.name} à l'élection de 2026 : toutes les courses et tous les candidats sur le bulletin de vote.`,
    alternates: pageAlternates(`/municipalities/${slug}`),
  };
}

export default function MunicipalityFr({ params }: Props) {
  return <MunicipalityPage params={params} locale="fr" />;
}

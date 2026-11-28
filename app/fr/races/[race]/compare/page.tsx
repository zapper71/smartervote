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
  if (!found) return { title: "Course introuvable" };
  const { race } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0
      ? `les ${issues.length} mêmes enjeux`
      : "les dix mêmes enjeux";
  return {
    title: `Comparer les candidats — ${localizeRaceName(race.name, "fr")}`,
    description: `Tous les candidats pour ${localizeRaceName(race.name, "fr")} côte à côte sur ${issuePhrase}, avec une source pour chaque affirmation.`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function CompareFr({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="fr" />;
}

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
  if (!found) return { title: "Race not found" };
  const { race } = found;
  // The count is read, not hard-coded — expansion municipalities won't
  // necessarily have ten issues, and the old text would lie about them.
  // Falls back to the long-standing wording when the database is down.
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0 ? `the same ${issues.length} issues` : "the same ten issues";
  return {
    title: `Compare candidates — ${race.name}`,
    description: `Every candidate for ${race.name} side by side on ${issuePhrase}, with a source for every claim.`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function Compare({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="en" />;
}

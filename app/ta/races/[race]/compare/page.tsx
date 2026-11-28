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
  if (!found) return { title: "தொகுதி கிடைக்கவில்லை" };
  const { race } = found;
  const issues = await getIssues(race.race_type, race.municipality_id);
  const issuePhrase =
    issues.length > 0
      ? `அதே ${issues.length} பிரச்சினைகள்`
      : "அதே பத்து பிரச்சினைகள்";
  return {
    title: `வேட்பாளர்களை ஒப்பிடுங்கள் — ${race.name}`,
    description: `${race.name}-இன் அனைத்து வேட்பாளர்களும் ${issuePhrase} பக்கத்தில் பக்கமாக, ஒவ்வொரு கூற்றுக்கும் மூலத்துடன்.`,
    alternates: pageAlternates(`/races/${slug}/compare`),
  };
}

export default function CompareTa({ params, searchParams }: Props) {
  return <ComparePage params={params} searchParams={searchParams} locale="ta" />;
}

import type { Metadata } from "next";
import RacePage from "@/components/pages/RacePage";
import {
  getRaceBySlugGlobal,
  getRaces,
  MUNICIPALITY_SLUG,
} from "@/lib/queries";
import { pageAlternates } from "@/components/pages/locale-meta";

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

type Props = { params: Promise<{ race: string }> };

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
  const { race, municipality } = found;
  // Place fragment, hardcoded in this wrapper's language (metadata
  // ui_string keys are unwired — same treatment as the FR wrappers).
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "2026年亨茨维尔市市政选举"
      : `2026年${municipality?.name ?? "Huntsville"}选举`;
  return {
    title: race.name,
    description:
      race.description ?? `参加${place}的${race.name}候选人。`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function RaceZhHans({ params }: Props) {
  return <RacePage params={params} locale="zh-Hans" />;
}

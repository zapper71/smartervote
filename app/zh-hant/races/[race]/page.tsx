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
  if (!found) return { title: "未找到該選區" };
  const { race, municipality } = found;
  // Place fragment, hardcoded in this wrapper's language (metadata
  // ui_string keys are unwired — same treatment as the FR wrappers).
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "2026年亨茨維爾市市政選舉"
      : `2026年${municipality?.name ?? "Huntsville"}選舉`;
  return {
    title: race.name,
    description:
      race.description ?? `參加${place}的${race.name}候選人。`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function RaceZhHant({ params }: Props) {
  return <RacePage params={params} locale="zh-Hant" />;
}

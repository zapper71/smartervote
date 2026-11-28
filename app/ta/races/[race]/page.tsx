import type { Metadata } from "next";
import { localizeRaceName } from "@/lib/i18n";
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
  if (!found) return { title: "தொகுதி கிடைக்கவில்லை" };
  const { race, municipality } = found;
  // Place fragment, hardcoded in this wrapper's language (metadata
  // ui_string keys are unwired — same treatment as the FR wrappers).
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "ஹன்ட்ஸ்வில்லி நகரின் 2026 நகராட்சித் தேர்தல்"
      : `${municipality?.name ?? "Huntsville"}-இன் 2026 தேர்தல்`;
  return {
    title: localizeRaceName(race.name, "ta"),
    description:
      race.description ?? `${localizeRaceName(race.name, "ta")} வேட்பாளர்கள் — ${place}.`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function RaceTa({ params }: Props) {
  return <RacePage params={params} locale="ta" />;
}

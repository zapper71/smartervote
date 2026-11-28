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
  if (!found) return { title: "ਹਲਕਾ ਨਹੀਂ ਮਿਲਿਆ" };
  const { race, municipality } = found;
  // Place fragment, hardcoded in this wrapper's language (metadata
  // ui_string keys are unwired — same treatment as the FR wrappers).
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "ਹੰਟਸਵਿਲ ਸ਼ਹਿਰ ਦੀ 2026 ਨਗਰਪਾਲਿਕਾ ਚੋਣ"
      : `${municipality?.name ?? "Huntsville"} ਦੀ 2026 ਚੋਣ`;
  return {
    title: localizeRaceName(race.name, "pa"),
    description:
      race.description ?? `${localizeRaceName(race.name, "pa")} ਦੇ ਉਮੀਦਵਾਰ — ${place}।`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function RacePa({ params }: Props) {
  return <RacePage params={params} locale="pa" />;
}

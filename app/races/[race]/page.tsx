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
  // Resilient on purpose: a database blip must not fail the deploy.
  // Anything not listed here still renders on demand.
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
  const { race, municipality } = found;
  // Huntsville keeps its exact long-standing description; everywhere else
  // gets the same shape with its own municipality's name.
  const place =
    municipality?.slug === MUNICIPALITY_SLUG
      ? "the Town of Huntsville 2026 municipal election"
      : `the ${municipality?.name ?? "Huntsville"} 2026 election`;
  return {
    title: race.name,
    description:
      race.description ?? `Candidates for ${race.name} in ${place}.`,
    alternates: pageAlternates(`/races/${slug}`),
  };
}

export default function Race({ params }: Props) {
  return <RacePage params={params} locale="en" />;
}

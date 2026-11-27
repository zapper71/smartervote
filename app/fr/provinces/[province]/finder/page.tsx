import type { Metadata } from "next";
import FinderPage from "@/components/pages/FinderPage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ province: string }>;
  searchParams?: Promise<{ level?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province introuvable" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal" || level === "provincial"
      ? "circonscription"
      : "municipalité";
  return {
    title: `Trouvez votre ${noun} · ${province.name}`,
    description: `Trouvez votre ${noun} à ${province.name}.`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function FinderFr({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="fr" />;
}

import type { Metadata } from "next";
import FinderPage from "@/components/pages/FinderPage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

// A dedicated page, not an inline reveal: on a phone an inline finder
// below the tiles is easy to miss entirely, while this page makes the
// search the whole point of the screen. The ?level= value comes from the
// tile that linked here and sets the finder's scope (municipality vs
// district vs riding): the page forwards the resolved entity to the
// finder, so a federal tile opens a ridings-only list, not the
// municipality list. Reading it opts this route into per-request
// rendering.
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
  if (!province) return { title: "Province not found" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal"
      ? "riding"
      : level === "provincial"
        ? "district"
        : "municipality";
  return {
    title: `Find your ${noun} · ${province.name}`,
    description: `Find your ${noun} in ${province.name}.`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function Finder({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="en" />;
}

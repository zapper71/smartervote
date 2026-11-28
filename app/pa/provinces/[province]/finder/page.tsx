import type { Metadata } from "next";
import { localizeProvinceName } from "@/lib/i18n";
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
  if (!province) return { title: "ਸੂਬਾ ਨਹੀਂ ਮਿਲਿਆ" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal" || level === "provincial"
      ? "ਹਲਕਾ"
      : "ਨਗਰਪਾਲਿਕਾ";
  return {
    title: `ਆਪਣਾ ${noun} ਲੱਭੋ · ${localizeProvinceName(province.name, "pa")}`,
    description: `${localizeProvinceName(province.name, "pa")} ਵਿੱਚ ਆਪਣਾ ${noun} ਲੱਭੋ।`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function FinderPa({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="pa" />;
}

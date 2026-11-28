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
  if (!province) return { title: "未找到該省" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal" || level === "provincial"
      ? "選區"
      : "市鎮";
  return {
    title: `尋找您的${noun} · ${localizeProvinceName(province.name, "zh-Hant")}`,
    description: `在${localizeProvinceName(province.name, "zh-Hant")}尋找您的${noun}。`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function FinderZhHant({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="zh-Hant" />;
}

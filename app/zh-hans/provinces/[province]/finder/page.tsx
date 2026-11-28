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
  if (!province) return { title: "未找到该省" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal" || level === "provincial"
      ? "选区"
      : "市镇";
  return {
    title: `查找您的${noun} · ${localizeProvinceName(province.name, "zh-Hans")}`,
    description: `在${localizeProvinceName(province.name, "zh-Hans")}查找您的${noun}。`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function FinderZhHans({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="zh-Hans" />;
}

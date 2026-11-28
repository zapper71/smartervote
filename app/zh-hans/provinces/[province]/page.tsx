import type { Metadata } from "next";
import ProvincePage from "@/components/pages/ProvincePage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ province: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "未找到该省" };
  return {
    title: `选举 — ${province.name}`,
    description: `SmarterVote 跟踪的联邦、省级和市级选举 — ${province.name}。`,
    alternates: pageAlternates(`/provinces/${slug}`),
  };
}

export default function ProvinceZhHans({ params }: Props) {
  return <ProvincePage params={params} locale="zh-Hans" />;
}

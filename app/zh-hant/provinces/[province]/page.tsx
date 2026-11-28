import type { Metadata } from "next";
import { localizeProvinceName } from "@/lib/i18n";
import ProvincePage from "@/components/pages/ProvincePage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ province: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "未找到該省" };
  return {
    title: `選舉 — ${localizeProvinceName(province.name, "zh-Hant")}`,
    description: `SmarterVote 追蹤的聯邦、省級和市級選舉 — ${localizeProvinceName(province.name, "zh-Hant")}。`,
    alternates: pageAlternates(`/provinces/${slug}`),
  };
}

export default function ProvinceZhHant({ params }: Props) {
  return <ProvincePage params={params} locale="zh-Hant" />;
}

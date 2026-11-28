import type { Metadata } from "next";
import ProvincePage from "@/components/pages/ProvincePage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ province: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "ਸੂਬਾ ਨਹੀਂ ਮਿਲਿਆ" };
  return {
    title: `ਚੋਣਾਂ — ${province.name}`,
    description: `SmarterVote ਦੁਆਰਾ ਟਰੈਕ ਕੀਤੀਆਂ ਸੰਘੀ, ਸੂਬਾਈ ਅਤੇ ਨਗਰਪਾਲਿਕਾ ਚੋਣਾਂ — ${province.name}।`,
    alternates: pageAlternates(`/provinces/${slug}`),
  };
}

export default function ProvincePa({ params }: Props) {
  return <ProvincePage params={params} locale="pa" />;
}

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
  if (!province) return { title: "மாகாணம் கிடைக்கவில்லை" };
  return {
    title: `தேர்தல்கள் — ${localizeProvinceName(province.name, "ta")}`,
    description: `SmarterVote கண்காணிக்கும் கூட்டாட்சி, மாகாண மற்றும் நகராட்சி தேர்தல்கள் — ${localizeProvinceName(province.name, "ta")}.`,
    alternates: pageAlternates(`/provinces/${slug}`),
  };
}

export default function ProvinceTa({ params }: Props) {
  return <ProvincePage params={params} locale="ta" />;
}

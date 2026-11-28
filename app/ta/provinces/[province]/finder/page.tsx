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
  if (!province) return { title: "மாகாணம் கிடைக்கவில்லை" };
  const sp = await searchParams;
  const level = typeof sp?.level === "string" ? sp.level : undefined;
  const noun =
    level === "federal" || level === "provincial"
      ? "தொகுதி"
      : "நகராட்சி";
  return {
    title: `உங்கள் ${noun}-ஐக் கண்டறியுங்கள் · ${localizeProvinceName(province.name, "ta")}`,
    description: `${localizeProvinceName(province.name, "ta")}-இல் உங்கள் ${noun}-ஐக் கண்டறியுங்கள்.`,
    alternates: pageAlternates(`/provinces/${slug}/finder`),
  };
}

export default function FinderTa({ params, searchParams }: Props) {
  return <FinderPage params={params} searchParams={searchParams} locale="ta" />;
}

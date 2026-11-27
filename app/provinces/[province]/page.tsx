import type { Metadata } from "next";
import ProvincePage from "@/components/pages/ProvincePage";
import { getProvince } from "@/lib/tracked-elections";
import { pageAlternates } from "@/components/pages/locale-meta";

// The current/next/past sections depend on today's date (filing deadline
// passed, one month after all results official), so province pages must
// render per request, never freeze at build time. That is why there is no
// generateStaticParams here: static prerendering would pin the sections to
// the build date and the transitions would never happen until a redeploy.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ province: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "Province not found" };
  return {
    title: `${province.name} elections`,
    description: `Federal, provincial and municipal elections tracked by SmarterVote in ${province.name}.`,
    alternates: pageAlternates(`/provinces/${slug}`),
  };
}

export default function Province({ params }: Props) {
  return <ProvincePage params={params} locale="en" />;
}

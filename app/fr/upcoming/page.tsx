import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Élections récentes et à venir",
  description:
    "Élections terminées au cours du dernier mois et élections à venir au cours des trois prochains mois, suivies par SmarterVote.",
  alternates: pageAlternates("/upcoming"),
};

export const dynamic = "force-dynamic";

export default function UpcomingFr() {
  return <UpcomingPage locale="fr" />;
}

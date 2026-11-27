import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "SmarterVote ne recueille aucun renseignement personnel, n'utilise aucun témoin et n'offre aucun compte.",
  alternates: pageAlternates("/privacy"),
};

export default function PrivacyFr() {
  return <PrivacyPage locale="fr" />;
}

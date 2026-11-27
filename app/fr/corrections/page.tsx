import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Signaler une correction",
  description:
    "Les candidats et le public peuvent signaler tout ce qui est inexact sur SmarterVote. Chaque correction est consignée, lue par une personne et fait l'objet d'une réponse.",
  alternates: pageAlternates("/corrections"),
};

export default function CorrectionsFr({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="fr" />;
}

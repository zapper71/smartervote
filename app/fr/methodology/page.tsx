import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Comment ça fonctionne",
  description:
    "Comment SmarterVote recueille, résume et vérifie les informations sur les candidats — et ce qu'il ne fait délibérément pas.",
  alternates: pageAlternates("/methodology"),
};

export default function MethodologyFr() {
  return <MethodologyPage locale="fr" />;
}

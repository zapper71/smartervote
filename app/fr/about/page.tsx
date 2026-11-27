import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Qui gère SmarterVote, pourquoi c'est gratuit et comment c'est financé.",
  alternates: pageAlternates("/about"),
};

export default function AboutFr() {
  return <AboutPage locale="fr" />;
}

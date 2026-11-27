import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — Ce que les candidats disent vraiment",
  description:
    "SmarterVote place tous les candidats côte à côte sur les mêmes enjeux, dans le même format, avec un lien vers la source pour chaque affirmation.",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function HomeFr() {
  return <HomePage locale="fr" />;
}

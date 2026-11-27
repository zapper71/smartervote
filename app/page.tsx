import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — What the candidates actually say",
  description:
    "SmarterVote puts every candidate side by side on the same issues, in the same format, with a link to the source for every claim.",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function Home() {
  return <HomePage locale="en" />;
}

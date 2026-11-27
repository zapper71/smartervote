import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who runs SmarterVote, why it's free, and how it's funded.",
  alternates: pageAlternates("/about"),
};

export default function About() {
  return <AboutPage locale="en" />;
}

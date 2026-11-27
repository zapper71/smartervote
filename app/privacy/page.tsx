import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "SmarterVote collects no personal information, sets no cookies, and has no accounts.",
  alternates: pageAlternates("/privacy"),
};

export default function Privacy() {
  return <PrivacyPage locale="en" />;
}

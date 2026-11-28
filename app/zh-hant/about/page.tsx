import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "關於我們",
  description:
    "誰在營運 SmarterVote，為什麼免費，以及如何獲得資助。",
  alternates: pageAlternates("/about"),
};

export default function AboutZhHant() {
  return <AboutPage locale="zh-Hant" />;
}

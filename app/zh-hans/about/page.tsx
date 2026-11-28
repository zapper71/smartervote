import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "谁在运营 SmarterVote，为什么免费，以及如何获得资助。",
  alternates: pageAlternates("/about"),
};

export default function AboutZhHans() {
  return <AboutPage locale="zh-Hans" />;
}

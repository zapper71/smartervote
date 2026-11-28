import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "運作方式",
  description:
    "SmarterVote 如何收集、總結和核實候選人資訊——以及我們刻意不做的事情。",
  alternates: pageAlternates("/methodology"),
};

export default function MethodologyZhHant() {
  return <MethodologyPage locale="zh-Hant" />;
}

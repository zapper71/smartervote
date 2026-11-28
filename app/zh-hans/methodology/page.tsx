import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "运作方式",
  description:
    "SmarterVote 如何收集、总结和核实候选人信息——以及我们刻意不做的事情。",
  alternates: pageAlternates("/methodology"),
};

export default function MethodologyZhHans() {
  return <MethodologyPage locale="zh-Hans" />;
}

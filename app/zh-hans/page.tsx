import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — 候选人真正说了什么",
  description:
    "SmarterVote 将所有候选人就同一议题并排展示，采用相同格式，每项主张都附有来源链接。",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function HomeZhHans() {
  return <HomePage locale="zh-Hans" />;
}

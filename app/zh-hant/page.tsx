import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — 候選人真正說了什麼",
  description:
    "SmarterVote 將所有候選人就同一議題並排展示，採用相同格式，每項主張都附有來源連結。",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function HomeZhHant() {
  return <HomePage locale="zh-Hant" />;
}

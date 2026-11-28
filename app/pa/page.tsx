import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — ਉਮੀਦਵਾਰਾਂ ਨੇ ਅਸਲ ਵਿੱਚ ਕੀ ਕਿਹਾ",
  description:
    "SmarterVote ਸਾਰੇ ਉਮੀਦਵਾਰਾਂ ਨੂੰ ਉਹੀ ਮੁੱਦਿਆਂ 'ਤੇ, ਉਸੇ ਫਾਰਮੈਟ ਵਿੱਚ, ਹਰ ਦਾਅਵੇ ਦੇ ਸਰੋਤ ਲਿੰਕ ਨਾਲ ਨਾਲੋ ਨਾਲ ਰੱਖਦਾ ਹੈ।",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function HomePa() {
  return <HomePage locale="pa" />;
}

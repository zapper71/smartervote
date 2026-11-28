import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "SmarterVote — வேட்பாளர்கள் உண்மையில் என்ன சொன்னார்கள்",
  description:
    "SmarterVote எல்லா வேட்பாளர்களையும் ஒரே பிரச்சினைகளில், ஒரே வடிவத்தில், ஒவ்வொரு கூற்றுக்கும் மூல இணைப்புடன் பக்கத்தில் பக்கமாக வைக்கிறது.",
  alternates: pageAlternates("/"),
};

export const revalidate = 3600; // Hourly (was 300s): Supabase egress control, Oct 2026

export default function HomeTa() {
  return <HomePage locale="ta" />;
}

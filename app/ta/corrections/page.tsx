import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "திருத்தம் தெரிவிக்க",
  description:
    "வேட்பாளர்களும் பொதுமக்களும் SmarterVote-இல் தவறான எதையும் தெரிவிக்கலாம். ஒவ்வொரு திருத்தமும் பதிவு செய்யப்பட்டு, ஒருவரால் படிக்கப்பட்டு, பதிலளிக்கப்படும்.",
  alternates: pageAlternates("/corrections"),
};

export default function CorrectionsTa({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="ta" />;
}

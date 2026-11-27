import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Report a correction",
  description:
    "Candidates and members of the public can report anything inaccurate on SmarterVote. Every correction is logged, read by a person, and answered.",
  alternates: pageAlternates("/corrections"),
};

export default function Corrections({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="en" />;
}

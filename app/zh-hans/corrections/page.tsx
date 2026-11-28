import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "报告更正",
  description:
    "候选人和公众可以报告 SmarterVote 上任何不准确的内容。每条更正都会被记录、由专人阅读并得到回复。",
  alternates: pageAlternates("/corrections"),
};

export default function CorrectionsZhHans({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="zh-Hans" />;
}

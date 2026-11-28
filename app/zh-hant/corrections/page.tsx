import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "報告更正",
  description:
    "候選人和公眾可以報告 SmarterVote 上任何不準確的內容。每條更正都會被記錄、由專人閱讀並得到回覆。",
  alternates: pageAlternates("/corrections"),
};

export default function CorrectionsZhHant({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="zh-Hant" />;
}

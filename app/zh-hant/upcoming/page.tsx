import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "近期和即將舉行的選舉",
  description:
    "過去一個月內已結束的選舉和未來三個月內即將舉行的選舉，由 SmarterVote 追蹤。",
  alternates: pageAlternates("/upcoming"),
};

export const dynamic = "force-dynamic";

export default function UpcomingZhHant() {
  return <UpcomingPage locale="zh-Hant" />;
}

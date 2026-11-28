import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "近期和即将举行的选举",
  description:
    "过去一个月内已结束的选举和未来三个月内即将举行的选举，由 SmarterVote 跟踪。",
  alternates: pageAlternates("/upcoming"),
};

export const dynamic = "force-dynamic";

export default function UpcomingZhHans() {
  return <UpcomingPage locale="zh-Hans" />;
}

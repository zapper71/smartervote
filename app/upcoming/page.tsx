import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "Recent & Upcoming Elections",
  description:
    "Elections finished within the last month and elections coming up within the next three months, tracked by SmarterVote.",
  alternates: pageAlternates("/upcoming"),
};

// The window is relative to the current date, so it must be computed per
// request, not once at build time.
export const dynamic = "force-dynamic";

export default function Upcoming() {
  return <UpcomingPage locale="en" />;
}

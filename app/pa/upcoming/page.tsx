import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "ਹਾਲੀਆ ਅਤੇ ਆਉਣ ਵਾਲੀਆਂ ਚੋਣਾਂ",
  description:
    "ਪਿਛਲੇ ਮਹੀਨੇ ਖਤਮ ਹੋਈਆਂ ਚੋਣਾਂ ਅਤੇ ਅਗਲੇ ਤਿੰਨ ਮਹੀਨਿਆਂ ਵਿੱਚ ਆਉਣ ਵਾਲੀਆਂ ਚੋਣਾਂ, SmarterVote ਦੁਆਰਾ ਟਰੈਕ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
  alternates: pageAlternates("/upcoming"),
};

export const dynamic = "force-dynamic";

export default function UpcomingPa() {
  return <UpcomingPage locale="pa" />;
}

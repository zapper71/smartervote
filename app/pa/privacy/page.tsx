import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "ਗੋਪਨੀਯਤਾ",
  description:
    "SmarterVote ਕੋਈ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਨਹੀਂ ਕਰਦਾ, ਕੋਈ ਕੂਕੀਜ਼ ਨਹੀਂ ਵਰਤਦਾ ਅਤੇ ਕੋਈ ਖਾਤੇ ਨਹੀਂ ਦਿੰਦਾ।",
  alternates: pageAlternates("/privacy"),
};

export default function PrivacyPa() {
  return <PrivacyPage locale="pa" />;
}

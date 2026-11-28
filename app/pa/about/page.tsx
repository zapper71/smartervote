import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "ਸਾਡੇ ਬਾਰੇ",
  description:
    "SmarterVote ਨੂੰ ਕੌਣ ਚਲਾਉਂਦਾ ਹੈ, ਇਹ ਮੁਫ਼ਤ ਕਿਉਂ ਹੈ ਅਤੇ ਇਸ ਨੂੰ ਫੰਡ ਕਿਵੇਂ ਮਿਲਦਾ ਹੈ।",
  alternates: pageAlternates("/about"),
};

export default function AboutPa() {
  return <AboutPage locale="pa" />;
}

import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
  description:
    "SmarterVote ਉਮੀਦਵਾਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਕਿਵੇਂ ਇਕੱਠੀ ਕਰਦਾ ਹੈ, ਸਾਰ ਲੈਂਦਾ ਹੈ ਅਤੇ ਜਾਂਚਦਾ ਹੈ — ਅਤੇ ਜਾਣਬੁੱਝ ਕੇ ਕੀ ਨਹੀਂ ਕਰਦਾ।",
  alternates: pageAlternates("/methodology"),
};

export default function MethodologyPa() {
  return <MethodologyPage locale="pa" />;
}

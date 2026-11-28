import type { Metadata } from "next";
import CorrectionsPage from "@/components/pages/CorrectionsPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "ਸੋਧ ਦੀ ਰਿਪੋਰਟ ਕਰੋ",
  description:
    "ਉਮੀਦਵਾਰ ਅਤੇ ਜਨਤਾ SmarterVote 'ਤੇ ਕਿਸੇ ਵੀ ਗਲਤ ਚੀਜ਼ ਦੀ ਰਿਪੋਰਟ ਕਰ ਸਕਦੇ ਹਨ। ਹਰ ਸੋਧ ਦਰਜ ਕੀਤੀ ਜਾਂਦੀ ਹੈ, ਕਿਸੇ ਵਿਅਕਤੀ ਦੁਆਰਾ ਪੜ੍ਹੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਜਵਾਬ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।",
  alternates: pageAlternates("/corrections"),
};

export default function CorrectionsPa({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; page?: string }>;
}) {
  return <CorrectionsPage searchParams={searchParams} locale="pa" />;
}

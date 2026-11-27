import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "How this works",
  description:
    "Exactly how SmarterVote gathers, summarises and reviews candidate information — and what it deliberately doesn't do.",
  alternates: pageAlternates("/methodology"),
};

export default function Methodology() {
  return <MethodologyPage locale="en" />;
}

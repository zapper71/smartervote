import type { Metadata } from "next";
import MethodologyPage from "@/components/pages/MethodologyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "இது எப்படி இயங்குகிறது",
  description:
    "SmarterVote வேட்பாளர் தகவல்களை எப்படி சேகரித்து, சுருக்கி, சரிபார்க்கிறது — மேலும் வேண்டுமென்றே செய்யாதவை எவை.",
  alternates: pageAlternates("/methodology"),
};

export default function MethodologyTa() {
  return <MethodologyPage locale="ta" />;
}

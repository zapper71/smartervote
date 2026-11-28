import type { Metadata } from "next";
import AboutPage from "@/components/pages/AboutPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "எங்களைப் பற்றி",
  description:
    "SmarterVote-ஐ யார் நடத்துகிறார்கள், அது ஏன் இலவசம், அதற்கு எப்படி நிதி கிடைக்கிறது.",
  alternates: pageAlternates("/about"),
};

export default function AboutTa() {
  return <AboutPage locale="ta" />;
}

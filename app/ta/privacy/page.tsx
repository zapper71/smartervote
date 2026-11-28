import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "தனியுரிமை",
  description:
    "SmarterVote எந்த தனிப்பட்ட தகவலையும் சேகரிப்பதில்லை, குக்கீகளைப் பயன்படுத்துவதில்லை, கணக்குகளை வழங்குவதில்லை.",
  alternates: pageAlternates("/privacy"),
};

export default function PrivacyTa() {
  return <PrivacyPage locale="ta" />;
}

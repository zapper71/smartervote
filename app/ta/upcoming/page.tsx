import type { Metadata } from "next";
import UpcomingPage from "@/components/pages/UpcomingPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "சமீபத்திய மற்றும் வரவிருக்கும் தேர்தல்கள்",
  description:
    "கடந்த மாதம் முடிந்த தேர்தல்கள் மற்றும் அடுத்த மூன்று மாதங்களில் வரவிருக்கும் தேர்தல்கள், SmarterVote கண்காணிக்கிறது.",
  alternates: pageAlternates("/upcoming"),
};

export const dynamic = "force-dynamic";

export default function UpcomingTa() {
  return <UpcomingPage locale="ta" />;
}

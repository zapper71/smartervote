import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "隐私",
  description:
    "SmarterVote 不收集任何个人信息，不使用任何 Cookie，也不提供帐户。",
  alternates: pageAlternates("/privacy"),
};

export default function PrivacyZhHans() {
  return <PrivacyPage locale="zh-Hans" />;
}

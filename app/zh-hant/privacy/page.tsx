import type { Metadata } from "next";
import PrivacyPage from "@/components/pages/PrivacyPage";
import { pageAlternates } from "@/components/pages/locale-meta";

export const metadata: Metadata = {
  title: "隱私",
  description:
    "SmarterVote 不收集任何個人資訊，不使用任何 Cookie，也不提供帳戶。",
  alternates: pageAlternates("/privacy"),
};

export default function PrivacyZhHant() {
  return <PrivacyPage locale="zh-Hant" />;
}

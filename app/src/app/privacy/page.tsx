import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalDocument } from "@/content/legal/documents";

export const metadata: Metadata = {
  title: `${getLegalDocument("privacy").title}｜樱聘 YingPin`,
};

// D-1: プライバシーポリシーの掲出ページ。本文の原本は docs/legal/privacy-draft.md。
export default function PrivacyPage() {
  return <LegalPage docKey="privacy" />;
}

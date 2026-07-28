import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalDocument } from "@/content/legal/documents";

export const metadata: Metadata = {
  title: `${getLegalDocument("terms").title}｜樱聘 YingPin`,
};

// D-1: 利用規約の掲出ページ。本文の原本は docs/legal/terms-draft.md。
export default function TermsPage() {
  return <LegalPage docKey="terms" />;
}

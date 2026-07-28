import type { Metadata } from "next";
import { DisclosurePage } from "@/components/legal/DisclosurePage";

export const metadata: Metadata = {
  title: "明示事項｜樱聘 YingPin",
  description: "職業安定法第32条の13に基づく明示事項（取扱職種の範囲等・手数料・苦情の処理・返戻金制度・個人情報の取扱い）",
};

// D-4: 職業安定法第32条の13の明示事項。本文の原本は docs/legal/terms-draft.md（第9条ほか）。
export default function Page() {
  return <DisclosurePage />;
}

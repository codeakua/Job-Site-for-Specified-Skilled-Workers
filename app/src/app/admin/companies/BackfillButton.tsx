"use client";

import { useFormStatus } from "react-dom";

/** 一括作成ボタン。送信中は disabled にして二重クリックの重複作成を防ぐ。 */
export function BackfillButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "作成中…" : label}
    </button>
  );
}

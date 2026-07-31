"use client";

import { useEffect, useState } from "react";

/**
 * 画面上部に短いメッセージを出す仕組み（モックの `showToast()` の移植）。
 *
 * スタイル（`#yp-toast` / `.show`）は `globals.css` にモックから移植済みだが、
 * 表示する側がNext版では作られていなかった。お気に入りの保存失敗など
 * 「ダイアログを出すほどではないが、黙って終わらせてはいけない」場面で使う。
 *
 * `layout.tsx` に1つだけ置き、どこからでも `showToast()` を呼べるようにしている。
 */

const DURATION_MS = 2200; // モック（assets/js/app.js）と同じ表示時間

type Listener = (message: string) => void;
let listener: Listener | null = null;

/** トーストを表示する。`<Toaster />` が描画されていないときは何もしない。 */
export function showToast(message: string) {
  listener?.(message);
}

export function Toaster() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    listener = (next) => { setMessage(next); setVisible(true); };
    return () => { listener = null; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, message]);

  // 読み上げソフトにも伝わるように role="status"（画面の邪魔をしない通知）にする。
  return (
    <div id="yp-toast" className={visible ? "show" : ""} role="status" aria-live="polite">
      {message}
    </div>
  );
}

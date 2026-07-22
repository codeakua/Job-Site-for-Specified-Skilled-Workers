"use client";

import { useEffect } from "react";

/**
 * `.reveal` クラスを持つ要素を画面に入ったタイミングで `.in` に切り替え、
 * スクロールで現れる演出を有効化する（モックの initReveal 相当）。
 * MutationObserver で後から追加された要素（求人カード等）にも自動対応する。
 * IntersectionObserver 非対応時やJS実行漏れに備え、全要素を可視化するフォールバック付き。
 * layout に一度だけ設置すれば、アプリ全体の `.reveal` がこれで動く。
 */
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );

    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // 保険: 万一Observerが発火しない環境でも、少し後に未表示分を可視化する。
    const fallback = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.5) el.classList.add("in");
      });
    }, 1200);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}

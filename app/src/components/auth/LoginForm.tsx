"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/components/providers";
import { IconBack, IconGlobe } from "@/components/icons";
import { login } from "@/lib/auth/client-auth";

/** `?redirect=` が無い／危険なときの既定の行き先。 */
const REDIRECT_FALLBACK = "/jobs";

/**
 * ログイン後の戻り先（`?redirect=`）を「同じサイト内の相対パス」だけに制限する（Issue #32）。
 *
 * 検証せずに使うと、攻撃者が `/login?redirect=https://evil.com` のようなリンクを送るだけで
 * ログイン直後に外部サイトへ飛ばせてしまう（本物のドメインから始まるのでフィッシングに使われる）。
 *
 * 判定の考え方:
 * - `useSearchParams()` が返す値は **すでに1回URLデコード済み**なので、
 *   ここで `decodeURIComponent()` は通さない。通すと `%252f%252fevil.com`（二重エンコード）を
 *   自分の手で `//evil.com` に復元してしまい、かえって穴になる。
 *   （不正な `%` 混じりの入力で例外が飛ぶ問題も避けられる）
 * - タブや改行などの制御文字は **ブラウザがURLを解釈する際に取り除かれる**ため、
 *   `/<TAB>/evil.com` が `//evil.com` に化ける。含まれていたら弾く。
 * - 残りは「`/` で始まり、その次が `/` でも `\` でもない」ものだけ許可する。
 *   `//evil.com`（プロトコル相対URL）と `/\evil.com`（ブラウザが `//` と同じに扱う）を除外できる。
 */
export function safeRedirect(raw: string | null): string {
  if (!raw) return REDIRECT_FALLBACK;
  const hasControlChar = [...raw].some((ch) => {
    const code = ch.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
  if (hasControlChar) return REDIRECT_FALLBACK;
  return /^\/(?![/\\])/.test(raw) ? raw : REDIRECT_FALLBACK;
}

export function LoginForm() {
  const { t, lang, toggleLang } = useAppState();
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("+81");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError("");
    if (!phone || !password) {
      setError(t("reg.err.required"));
      return;
    }
    setBusy(true);
    const res = await login(code, phone, password);
    if (!res.ok) {
      setError(t(res.errorKey, res.errorDetail ? { detail: res.errorDetail } : undefined));
      setBusy(false);
      return;
    }
    const target = safeRedirect(params.get("redirect"));
    router.push(target);
    router.refresh();
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="icon-btn" href="/">
          <span className="icon">
            <IconBack />
          </span>
        </Link>
        <div className="spacer" />
        <button type="button" className="lang-pill" onClick={toggleLang}>
          <span className="icon">
            <IconGlobe />
          </span>
          <span>{lang === "ja" ? "中文" : "日本語"}</span>
        </button>
      </header>

      <div className="auth-wrap">
        <div className="auth-logo">
          <span className="brand-mark">🌸</span>
          <div>
            <h1>{t("login.title")}</h1>
            <p>{t("login.sub")}</p>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="l-phone">
            <span>{t("login.phone")}</span>
          </label>
          <div className="input-row">
            <select className="input code" value={code} onChange={(e) => setCode(e.target.value)}>
              <option value="+81">🇯🇵 +81</option>
              <option value="+86">🇨🇳 +86</option>
            </select>
            <input
              className="input"
              id="l-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("reg.phone.ph")}
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="l-pass">
            <span>{t("login.password")}</span>
          </label>
          <input
            className="input"
            id="l-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.password.ph")}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={onSubmit}>
          {busy ? "…" : t("login.btn")}
        </button>

        <div className="auth-links">
          <Link href="/register">{t("login.toRegister")}</Link>
        </div>
      </div>
    </div>
  );
}

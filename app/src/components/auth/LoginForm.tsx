"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/components/providers";
import { IconBack, IconGlobe } from "@/components/icons";
import { login } from "@/lib/auth/client-auth";

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
    const target = params.get("redirect") || "/jobs";
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

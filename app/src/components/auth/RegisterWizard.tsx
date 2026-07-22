"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import { pick } from "@/lib/i18n";
import { FIELDS } from "@/data/mock-data";
import { IconBack, IconCheck, IconGlobe } from "@/components/icons";
import { registerMember, type RegisterInput } from "@/lib/auth/client-auth";

const EMPTY: RegisterInput = {
  lastName: "", firstName: "", pinyin: "", birth: "", gender: "",
  nationality: "cn", residence: "jp", address: "",
  phoneCode: "+81", phone: "", wechat: "", email: "",
  jlpt: "none", ssw: [], otherQual: "", password: "",
};

export function RegisterWizard() {
  const { t, lang, toggleLang } = useAppState();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterInput>(EMPTY);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null); // 完了後の会員番号

  const set = <K extends keyof RegisterInput>(k: K, v: RegisterInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function toggleSsw(id: string) {
    setForm((f) => {
      const has = f.ssw.includes(id);
      return { ...f, ssw: has ? f.ssw.filter((x) => x !== id) : [...f.ssw, id] };
    });
  }

  function validate(n: number): boolean {
    if (n === 1)
      return !!(form.lastName && form.firstName && form.pinyin && form.birth && form.gender && form.address);
    if (n === 2) return !!(form.phone && form.wechat && form.password.length >= 8);
    return true;
  }

  function next() {
    setError("");
    if (!validate(step)) {
      setError(step === 2 && form.password.length < 8 ? t("reg.err.password") : t("reg.err.required"));
      return;
    }
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setError("");
    if (!agree) {
      setError(t("reg.err.agree"));
      return;
    }
    setBusy(true);
    const res = await registerMember(form);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setDone(res.memberNo);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- 完了画面 ---------- */
  if (done) {
    return (
      <div className="shell">
        <Petals />
        <section className="done-wrap">
          <div className="done-ring">
            <div className="done-check">
              <span className="icon">
                <IconCheck />
              </span>
            </div>
          </div>
          <h1>{t("reg.done.title")}</h1>
          <p className="done-sub">{t("reg.done.sub")}</p>
          <div className="member-card">
            <span>{t("reg.done.accountId")}</span>
            <b>{done}</b>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              router.push("/jobs");
              router.refresh();
            }}
          >
            {t("reg.done.cta")}
          </button>
        </section>
      </div>
    );
  }

  const STEP_KEYS = ["reg.step1", "reg.step2", "reg.step3", "reg.step4"];

  return (
    <div className="shell">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => (step > 1 ? back() : router.push("/"))}
        >
          <span className="icon">
            <IconBack />
          </span>
        </button>
        <div className="topbar-title">{t("reg.title")}</div>
        <div className="spacer" />
        <button type="button" className="lang-pill" onClick={toggleLang}>
          <span className="icon">
            <IconGlobe />
          </span>
          <span>{lang === "ja" ? "中文" : "日本語"}</span>
        </button>
      </header>

      {/* 進捗 */}
      <div className="steps" style={{ ["--p" as string]: (step - 1) / 3 }}>
        {STEP_KEYS.map((k, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "";
          return (
            <div className={`step ${state}`} key={k}>
              <div className="step-dot">
                {n < step ? (
                  <span className="icon">
                    <IconCheck />
                  </span>
                ) : (
                  n
                )}
              </div>
              <span>{t(k)}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1 基本情報 */}
      {step === 1 && (
        <section className="step-panel">
          <div className="step-head">
            <h2>{t("reg.step1.title")}</h2>
            <p>{t("reg.step1.sub")}</p>
          </div>
          <div className="row2">
            <Field label={t("reg.lastName")} required>
              <input className="input" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder={t("reg.lastName.ph")} />
            </Field>
            <Field label={t("reg.firstName")} required>
              <input className="input" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder={t("reg.firstName.ph")} />
            </Field>
          </div>
          <Field label={t("reg.pinyin")} required>
            <input className="input" style={{ textTransform: "uppercase" }} value={form.pinyin} onChange={(e) => set("pinyin", e.target.value)} placeholder={t("reg.pinyin.ph")} />
          </Field>
          <Field label={t("reg.birth")} required>
            <input className="input" type="date" max="2008-12-31" min="1960-01-01" value={form.birth} onChange={(e) => set("birth", e.target.value)} />
          </Field>
          <Field label={t("reg.gender")} required>
            <div className="opt-chips">
              {(["male", "female", "other"] as const).map((g) => (
                <Chip key={g} checked={form.gender === g} onClick={() => set("gender", g)}>
                  {t("reg.gender." + g)}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label={t("reg.nationality")} required>
            <select className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)}>
              <option value="cn">{t("reg.nationality.cn")}</option>
              <option value="other">{t("reg.nationality.other")}</option>
            </select>
          </Field>
          <Field label={t("reg.residence")} required>
            <div className="opt-chips">
              <Chip checked={form.residence === "jp"} onClick={() => set("residence", "jp")}>🇯🇵 {t("reg.residence.jp")}</Chip>
              <Chip checked={form.residence === "cn"} onClick={() => set("residence", "cn")}>🇨🇳 {t("reg.residence.cn")}</Chip>
            </div>
          </Field>
          <Field label={t("reg.address")} required>
            <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder={t(form.residence === "jp" ? "reg.address.phJp" : "reg.address.phCn")} />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <div className="step-nav">
            <button type="button" className="btn btn-primary btn-block" onClick={next}>
              {t("common.next")}
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 連絡先＋パスワード */}
      {step === 2 && (
        <section className="step-panel">
          <div className="step-head">
            <h2>{t("reg.step2.title")}</h2>
            <p>{t("reg.step2.sub")}</p>
          </div>
          <Field label={t("reg.phone")} required>
            <div className="input-row">
              <select className="input code" value={form.phoneCode} onChange={(e) => set("phoneCode", e.target.value)}>
                <option value="+81">🇯🇵 +81</option>
                <option value="+86">🇨🇳 +86</option>
              </select>
              <input className="input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("reg.phone.ph")} />
            </div>
          </Field>
          <Field label={t("reg.password")} required>
            <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={t("reg.password.ph")} />
            <p className="hint">🔑 {t("reg.password.note")}</p>
          </Field>
          <Field label={t("reg.wechat")} required>
            <input className="input" value={form.wechat} onChange={(e) => set("wechat", e.target.value)} placeholder={t("reg.wechat.ph")} />
            <p className="hint">💬 {t("reg.wechat.note")}</p>
          </Field>
          <Field label={t("reg.email")} optional>
            <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={t("reg.email.ph")} />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <div className="step-nav">
            <button type="button" className="btn btn-back" onClick={back}>{t("common.back")}</button>
            <button type="button" className="btn btn-primary" onClick={next}>{t("common.next")}</button>
          </div>
        </section>
      )}

      {/* STEP 3 資格 */}
      {step === 3 && (
        <section className="step-panel">
          <div className="step-head">
            <h2>{t("reg.step3.title")}</h2>
            <p>{t("reg.step3.sub")}</p>
          </div>
          <Field label={t("reg.jlpt")} required>
            <div className="opt-chips">
              {["N1", "N2", "N3", "N4", "N5"].map((lv) => (
                <Chip key={lv} checked={form.jlpt === lv} onClick={() => set("jlpt", lv)}>{lv}</Chip>
              ))}
              <Chip checked={form.jlpt === "none"} onClick={() => set("jlpt", "none")}>{t("reg.jlpt.none")}</Chip>
            </div>
          </Field>
          <Field label={t("reg.ssw")}>
            <p className="hint" style={{ margin: "0 0 10px" }}>{t("reg.ssw.note")}</p>
            <div className="opt-chips">
              {FIELDS.map((f) => (
                <Chip key={f.id} checked={form.ssw.includes(f.id)} onClick={() => toggleSsw(f.id)}>
                  {f.emoji} {pick(lang, f.name)}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label={t("reg.otherQual")} optional>
            <textarea className="input" rows={3} value={form.otherQual} onChange={(e) => set("otherQual", e.target.value)} placeholder={t("reg.otherQual.ph")} />
          </Field>
          <div className="step-nav">
            <button type="button" className="btn btn-back" onClick={back}>{t("common.back")}</button>
            <button type="button" className="btn btn-primary" onClick={next}>{t("common.next")}</button>
          </div>
        </section>
      )}

      {/* STEP 4 確認 */}
      {step === 4 && (
        <section className="step-panel">
          <div className="step-head">
            <h2>{t("reg.step4.title")}</h2>
            <p>{t("reg.step4.sub")}</p>
          </div>
          <dl className="confirm-list">
            <Row k={t("reg.lastName").replace(/（.+）/, "") + "・" + t("reg.firstName").replace(/（.+）/, "")}>
              {form.lastName} {form.firstName}
              <br />
              <small style={{ color: "var(--text-sub)" }}>{form.pinyin}</small>
            </Row>
            <Row k={t("reg.birth")}>{form.birth || "—"}</Row>
            <Row k={t("reg.gender")}>{form.gender ? t("reg.gender." + form.gender) : "—"}</Row>
            <Row k={t("reg.residence")}>
              {t(form.residence === "jp" ? "reg.residence.jp" : "reg.residence.cn")}
              <br />
              <small style={{ color: "var(--text-sub)" }}>{form.address}</small>
            </Row>
            <Row k={t("reg.phone")}>{form.phoneCode} {form.phone}</Row>
            <Row k={t("reg.wechat")}>{form.wechat || "—"}</Row>
            <Row k={t("reg.jlpt")}>{form.jlpt === "none" ? t("reg.jlpt.none") : form.jlpt}</Row>
            <Row k={t("reg.ssw")}>
              {form.ssw.length
                ? form.ssw.map((id) => pick(lang, FIELDS.find((f) => f.id === id)!.name)).join("、")
                : t("reg.ssw.none")}
            </Row>
            <Row k={t("reg.otherQual")}>{form.otherQual || "—"}</Row>
          </dl>
          <label className="agree-row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span className="agree-box">
              <span className="icon">
                <IconCheck />
              </span>
            </span>
            <span className="agree-text">{t("reg.agree")}</span>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="step-nav">
            <button type="button" className="btn btn-back" onClick={back}>{t("common.back")}</button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
              {busy ? "…" : t("reg.submit")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- 小さな部品 ---------- */
function Field({ label, required, optional, children }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode }) {
  const { t } = useAppState();
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        {required && <span className="req">{t("common.required")}</span>}
        {optional && <span className="opt">{t("common.optional")}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <label className="opt-chip">
      <input type="checkbox" checked={checked} onChange={onClick} />
      <span>{children}</span>
    </label>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="confirm-row">
      <dt>{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* お祝いの桜吹雪 */
function Petals() {
  const colors = ["#7cc0ff", "#a5d8ff", "#4d9fff", "#cfe8ff", "#ffd166"];
  const petals = Array.from({ length: 24 }, (_, i) => {
    const left = ((i * 37) % 100) + Math.floor((i % 5) * 2);
    const delay = ((i % 7) * 0.18).toFixed(2);
    const dur = (2.6 + (i % 5) * 0.4).toFixed(2);
    const drift = ((i % 6) * 12 - 30).toFixed(0);
    const spin = ((i % 8) * 90 - 300).toFixed(0);
    return (
      <span
        key={i}
        className="petal"
        style={{
          left: `${left}%`,
          background: colors[i % colors.length],
          animationDelay: `${delay}s`,
          animationDuration: `${dur}s`,
          ["--drift" as string]: `${drift}px`,
          ["--spin" as string]: `${spin}deg`,
        }}
      />
    );
  });
  return <div className="petals">{petals}</div>;
}

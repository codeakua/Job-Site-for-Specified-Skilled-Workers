"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import { pick } from "@/lib/i18n";
import { FIELDS } from "@/data/mock-data";
import { IconBack, IconCheck, IconGlobe } from "@/components/icons";
import { registerMember, type RegisterForm } from "@/lib/auth/client-auth";
import { firstPasswordIssue, passwordIssueKey } from "@/lib/auth/password-policy";
import { birthIssue, birthIssueKey, birthRange } from "@/lib/auth/birth-policy";

const EMPTY: RegisterForm = {
  lastName: "", firstName: "", pinyin: "", birth: "", gender: "",
  nationality: "cn", residence: "jp", address: "",
  phoneCode: "+81", phone: "", wechat: "", email: "",
  jlpt: "none", ssw: [], otherQual: "", password: "",
};

// 日付入力の選択範囲（18歳の誕生日〜）。日本時間の今日から求めるので、
// 年をまたいでも「17歳が選べる」状態にはならない（birth-policy.ts 参照）。
const BIRTH_RANGE = birthRange();

export function RegisterWizard() {
  const { t, lang, toggleLang } = useAppState();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterForm>(EMPTY);
  const [error, setError] = useState("");
  // 一般化した登録エラー（Issue #35）に添えるログイン導線を出すか。
  const [loginHint, setLoginHint] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  // honeypot（隠しフィールド・Issue #30）。人間は触れないので常に空のまま送られる。
  const [honeypot, setHoneypot] = useState("");
  // 完了画面の表示フラグ＋DBが採番した会員番号＋その場でログイン状態にできたか。
  // 番号は空文字になり得る（DB採番を読み戻せなかった場合）ため、文字列ではなくオブジェクトで持つ。
  const [done, setDone] = useState<{ memberNo: string; signedIn: boolean } | null>(null);

  const set = <K extends keyof RegisterForm>(k: K, v: RegisterForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  /*
    同意文の中の「利用規約」「プライバシーポリシー」をリンクにする（D-1）。
    ・語順が日中で異なる（日「規約と方針に同意する」／中「同意 规约 和 政策」）ため、
      文言そのものをテンプレートで持ち、{terms}{privacy} の位置で差し替える。
    ・**必ず別タブで開く**。ウィザードの途中で遷移すると入力がすべて消えるため。
  */
  const agreeLabel = t("reg.agree.tpl")
    .split(/(\{terms\}|\{privacy\})/g)
    .map((part, i) => {
      if (part === "{terms}") {
        return (
          <Link key={i} href="/terms" target="_blank" rel="noopener noreferrer" className="agree-link">
            {t("legal.terms")}
          </Link>
        );
      }
      if (part === "{privacy}") {
        return (
          <Link key={i} href="/privacy" target="_blank" rel="noopener noreferrer" className="agree-link">
            {t("legal.privacy")}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });

  /** パスワードの違反（サーバー側 /api/auth/register と同じ関数で判定する）。 */
  const pwIssue = form.password
    ? firstPasswordIssue(form.password, `${form.phoneCode}${form.phone}`)
    : null;

  function toggleSsw(id: string) {
    setForm((f) => {
      const has = f.ssw.includes(id);
      return { ...f, ssw: has ? f.ssw.filter((x) => x !== id) : [...f.ssw, id] };
    });
  }

  function validate(n: number): boolean {
    if (n === 1)
      return !!(form.lastName && form.firstName && form.pinyin && form.birth && form.gender && form.address);
    return true;
  }

  function next() {
    setError("");
    setLoginHint(false);
    // STEP1 は年齢まで見てから進める。date入力の max だけでは、
    // 直接入力やブラウザ差で18歳未満の値が残り得るため。
    if (step === 1) {
      if (!validate(1)) {
        setError(t("reg.err.required"));
        return;
      }
      const bIssue = birthIssue(form.birth);
      if (bIssue) {
        setError(t(birthIssueKey(bIssue)));
        return;
      }
    }
    // STEP2 はパスワード規則（サーバーと同じ）まで見てから進める。
    // ここで通しておけば、送信してから英語のエラーが返る事態を避けられる。
    else if (step === 2) {
      if (!form.phone || !form.wechat || !form.password) {
        setError(t("reg.err.required"));
        return;
      }
      if (pwIssue) {
        setError(t(passwordIssueKey(pwIssue)));
        return;
      }
    } else if (!validate(step)) {
      setError(t("reg.err.required"));
      return;
    }
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setError("");
    setLoginHint(false);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setError("");
    setLoginHint(false);
    if (!agree) {
      setError(t("reg.err.agree"));
      return;
    }
    setBusy(true);
    // 同意チェックはウィザードの form とは別の state で持っているので、送信時に合流させる。
    // サーバー側でも同じ値を検証し、同意記録（member_consents）に残す（D-2）。
    const res = await registerMember({ ...form, agree }, honeypot);
    if (!res.ok) {
      setError(t(res.errorKey, res.errorDetail ? { detail: res.errorDetail } : undefined));
      setLoginHint(Boolean(res.loginHint));
      setBusy(false);
      return;
    }
    setDone({ memberNo: res.memberNo, signedIn: res.signedIn });
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
          {done.memberNo && (
            <div className="member-card">
              <span>{t("reg.done.accountId")}</span>
              <b>{done.memberNo}</b>
            </div>
          )}
          {/*
            登録は成功しているが、その場でログイン状態にできなかった場合（トークンの
            引き継ぎに失敗）。そのまま求人一覧へ進ませるとログイン画面へ弾き返されて
            理由が分からなくなるので、ログイン画面へ誘導する。
          */}
          {!done.signedIn && <p className="form-error">{t("reg.done.loginNeeded")}</p>}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => {
              router.push(done.signedIn ? "/jobs" : "/login");
              router.refresh();
            }}
          >
            {t(done.signedIn ? "reg.done.cta" : "reg.done.ctaLogin")}
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

      <p className="free-note">💴 {t("reg.freeNote")}</p>

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
            <input className="input" type="date" max={BIRTH_RANGE.max} min={BIRTH_RANGE.min} value={form.birth} onChange={(e) => set("birth", e.target.value)} />
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
            {/* 入力中にその場で規則違反を知らせる（送信してから英語エラーが返るのを防ぐ・Issue #31） */}
            <p className="hint" style={pwIssue ? { color: "var(--danger)" } : undefined}>
              🔑 {pwIssue ? t(passwordIssueKey(pwIssue)) : t("reg.password.rule")}
            </p>
            <p className="hint">{t("reg.password.note")}</p>
          </Field>
          <Field label={t("reg.wechat")} required>
            <input className="input" value={form.wechat} onChange={(e) => set("wechat", e.target.value)} placeholder={t("reg.wechat.ph")} />
            <p className="hint">💬 {t("reg.wechat.note")}</p>
          </Field>
          <Field label={t("reg.email")} optional>
            <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={t("reg.email.ph")} />
          </Field>
          {/*
            honeypot（Issue #30）: 画面外に置いた隠しフィールド。
            人間には見えず、キーボード操作でも到達しない（tabIndex=-1）ので必ず空のまま送られる。
            自動でフォームを埋める bot だけがここに値を入れるため、サーバー側で弾ける。
            ブラウザの自動入力に巻き込まれないよう autoComplete="off" と一般的でない名前にしてある。
          */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
          >
            <label htmlFor="contact-note">Contact note</label>
            <input
              id="contact-note"
              name="contact_note"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
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
            <span className="agree-text">{agreeLabel}</span>
          </label>
          {error && <p className="form-error">{error}</p>}
          {/*
            登録エラーは「すでに登録済み」かどうかを明かさない一般化文言にしてある（Issue #35）。
            そのままだと本当に登録済みの人が行き止まりになるため、ログイン画面への導線を添える。
            この導線は「登録できなかった」全ケースで同じように出るので、番号の登録有無は分からない。
          */}
          {loginHint && (
            <div className="auth-links" style={{ marginTop: 0, marginBottom: 14 }}>
              <Link href="/login">{t("reg.toLogin")}</Link>
            </div>
          )}
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

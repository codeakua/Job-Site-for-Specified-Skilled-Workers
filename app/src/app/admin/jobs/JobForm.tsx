import Link from "next/link";
import { FIELDS, REGIONS } from "@/data/mock-data";
import { JOB_BENEFITS, JOB_TAGS, regionLabel } from "@/lib/admin/labels";
import { translate } from "@/lib/i18n";
import { saveJob } from "./actions";
import type { AdminJob } from "./types";
import type { CompanyOption } from "../companies/types";

/**
 * 求人フォーム（新規/編集共用・Server Component＝クライアントJSなし）。
 * 日中2言語の項目は必ず「日本語｜中文」を左右ペアで並べ、翻訳の突き合わせをしやすくする。
 */

function textValue(job: Partial<AdminJob>, key: string) {
  const value = (job as Record<string, unknown>)[key];
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value : "";
}

function InputPair({ base, label, job, required = false }: { base: string; label: string; job: Partial<AdminJob>; required?: boolean }) {
  return (
    <>
      <label className="field">
        <span>{label}（日本語）{required ? "※必須" : ""}</span>
        <input className="input" name={`${base}_ja`} defaultValue={textValue(job, `${base}_ja`)} required={required} />
      </label>
      <label className="field">
        <span>{label}（中文）{required ? "※必須" : ""}</span>
        <input className="input" name={`${base}_zh`} defaultValue={textValue(job, `${base}_zh`)} required={required} />
      </label>
    </>
  );
}

function TextPair({ base, label, job, rows = 3 }: { base: string; label: string; job: Partial<AdminJob>; rows?: number }) {
  return (
    <>
      <label className="field">
        <span>{label}（日本語）</span>
        <textarea className="input" name={`${base}_ja`} defaultValue={textValue(job, `${base}_ja`)} rows={rows} />
      </label>
      <label className="field">
        <span>{label}（中文）</span>
        <textarea className="input" name={`${base}_zh`} defaultValue={textValue(job, `${base}_zh`)} rows={rows} />
      </label>
    </>
  );
}

function NumField({ name, label, job, required = false }: { name: string; label: string; job: Partial<AdminJob>; required?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} type="number" defaultValue={textValue(job, name)} required={required} />
    </label>
  );
}

function CheckGroup({ name, values, selected, prefix }: { name: string; values: string[]; selected?: string[]; prefix: "tag" | "ben" }) {
  return (
    <div className="admin-checks">
      {values.map((value) => (
        <label className="admin-check" key={value}>
          <input name={name} type="checkbox" value={value} defaultChecked={(selected ?? []).includes(value)} />
          <span>{translate("ja", `${prefix}.${value}`)}</span>
        </label>
      ))}
    </div>
  );
}

export function JobForm({ job, companies }: { job: Partial<AdminJob>; companies: CompanyOption[] }) {
  return (
    <form action={saveJob}>
      {job.id ? <input type="hidden" name="id" value={job.id} /> : null}

      <section className="admin-fieldset">
        <h2>基本情報</h2>
        <div className="admin-form-grid cols-4">
          <label className="field">
            <span>分野</span>
            <select className="input" name="field_id" defaultValue={job.field_id}>
              {FIELDS.map((f) => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name.ja}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>エリア（地方）</span>
            <select className="input" name="region" defaultValue={job.region}>
              {REGIONS.map((region) => (
                <option key={region} value={region}>{regionLabel(region)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>ステータス</span>
            <select className="input" name="status" defaultValue={job.status ?? "draft"}>
              <option value="draft">下書き</option>
              <option value="published">公開</option>
            </select>
          </label>
          <label className="admin-check">
            <input name="is_new" type="checkbox" defaultChecked={Boolean(job.is_new)} />
            <span>新着表示（NEW）</span>
          </label>
        </div>
        <div className="admin-form-grid">
          <InputPair base="title" label="求人タイトル" job={job} required />
          <InputPair base="area" label="勤務地" job={job} required />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>給与・賞与</h2>
        <div className="admin-form-grid cols-4">
          <NumField name="salary_min" label="月給下限（万円）※必須" job={job} required />
          <NumField name="salary_max" label="月給上限（万円）※必須" job={job} required />
          <NumField name="annual_min" label="想定年収下限（万円）" job={job} />
          <NumField name="annual_max" label="想定年収上限（万円）" job={job} />
        </div>
        <div className="admin-form-grid">
          <TextPair base="bonus" label="賞与・昇給" job={job} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>勤務条件</h2>
        <div className="admin-form-grid">
          <TextPair base="hours" label="勤務時間" job={job} />
          <TextPair base="holidays" label="休日・休暇" job={job} />
          <TextPair base="overtime" label="残業" job={job} />
          <TextPair base="requirements" label="応募条件" job={job} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>待遇・環境</h2>
        <p className="admin-sub-h">こだわりタグ</p>
        <CheckGroup name="tags" values={JOB_TAGS} selected={job.tags} prefix="tag" />
        <p className="admin-sub-h">福利厚生</p>
        <CheckGroup name="benefits" values={JOB_BENEFITS} selected={job.benefits} prefix="ben" />
        <p className="admin-sub-h">中国語サポート</p>
        <div className="admin-checks">
          <label className="admin-check">
            <input name="chinese_support" type="checkbox" defaultChecked={Boolean(job.chinese_support)} />
            <span>中国語サポートあり（会員側にバッジ表示）</span>
          </label>
        </div>
        <div className="admin-form-grid" style={{ marginTop: 12 }}>
          <TextPair base="housing" label="住まい" job={job} />
          <TextPair base="chinese_staff" label="中国人スタッフ" job={job} />
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>企業情報（匿名プロフィール）</h2>
        <div className="admin-form-grid">
          <label className="field">
            <span>求人企業（管理用の紐づけ）</span>
            <select className="input" name="company_id" defaultValue={job.company_id ?? ""}>
              <option value="">（未設定）</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.record_no !== null ? `${c.record_no}｜` : ""}{c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="admin-hint">
            ※ 会員側には一切表示されません。どの企業の求人票か管理画面で分かるようにするための紐づけです（企業の追加・編集は「企業管理」から）。
          </p>
        </div>
        <div className="admin-form-grid">
          <TextPair base="company" label="企業プロフィール" job={job} />
          <p className="admin-hint span-2">
            ※ 会社名・特定できる住所は書かないでください（業種・規模などの匿名情報のみ。会員側には「会社名・詳細な住所は応募後に開示」と表示されます）。
          </p>
        </div>
      </section>

      <section className="admin-fieldset">
        <h2>説明文・業務内容</h2>
        <div className="admin-form-grid">
          <TextPair base="desc" label="仕事内容" job={job} rows={5} />
          <TextPair base="duties" label="主な業務" job={job} rows={6} />
          <p className="admin-hint span-2">※ 主な業務は「1行に1項目」で入力してください（会員側で箇条書き表示されます）。</p>
        </div>
      </section>

      <div className="admin-form-bar">
        <Link className="btn" href="/admin/jobs">キャンセル（一覧へ戻る）</Link>
        <button className="btn btn-primary" type="submit">保存する</button>
      </div>
    </form>
  );
}

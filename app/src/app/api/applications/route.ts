import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MEMBER_NOTIFY_COLS,
  notifyNewApplication,
  type JobInfo,
  type MemberInfo,
} from "@/lib/notify";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/request";

const JOB_COLS = "id, title_ja, title_zh, area_ja, region";

/** 1会員が1時間に出せる応募の上限。求人は十数件なので、正規の利用者が当たることはまずない。 */
const APPLY_LIMIT = 20;
const APPLY_WINDOW_SEC = 60 * 60;

/**
 * 応募API（POST /api/applications）。
 * - 認証必須（RLSにより自分の応募のみ保存可）。
 * - 重複応募（unique(member_id, job_id) 違反 = 23505）は冪等に成功扱い。
 *   → **通知メールは (会員, 求人) の組ごとに1通**になる（DBの一意制約が保証）。
 * - 新規応募が保存できたときだけスタッフへ通知メールを送る（通知失敗は応募を失敗させない）。
 * - Issue #30: 会員あたりの回数制限と Origin 検証を追加（存在しない求人IDへの連投などを抑止）。
 */
export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const verdict = await consumeRateLimit({
    key: `applications:${user.id}`,
    limit: APPLY_LIMIT,
    windowSec: APPLY_WINDOW_SEC,
  });
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfterSec) } },
    );
  }

  const body = (await req.json().catch(() => null)) as { job_id?: unknown } | null;
  const jobId = Number(body?.job_id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return NextResponse.json({ ok: false, error: "invalid job_id" }, { status: 400 });
  }

  const { error } = await supabase.from("applications").insert({ member_id: user.id, job_id: jobId });
  if (error) {
    if (error.code === "23505") {
      // 既に応募済み。冪等に成功扱いとし、通知は送らない。
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[applications] insert error:", error);
    return NextResponse.json({ ok: false, error: "insert failed" }, { status: 400 });
  }

  // 新規応募 → スタッフへ通知。通知の失敗で応募自体は失敗させない。
  try {
    const [{ data: member }, { data: job }] = await Promise.all([
      supabase.from("members").select(MEMBER_NOTIFY_COLS).eq("id", user.id).maybeSingle(),
      supabase.from("jobs").select(JOB_COLS).eq("id", jobId).maybeSingle(),
    ]);
    if (member && job) {
      await notifyNewApplication(member as MemberInfo, job as JobInfo, new URL(req.url).origin);
    }
  } catch (e) {
    console.error("[applications] notify error:", e);
  }

  return NextResponse.json({ ok: true });
}

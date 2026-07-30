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
 * 失敗の応答。`errorKey` は**会員側の画面がそのまま `t()` に渡す辞書キー**で、
 * クライアントがHTTPステータスを自前で文言に対応づけないための契約
 * （`lib/auth/client-auth.ts` が登録APIで使っているのと同じ方式）。
 * `error` は英語のままログ・デバッグ用に残す。
 */
function fail(status: number, error: string, errorKey: string, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error, errorKey }, { status, headers });
}

/**
 * 応募API（POST /api/applications）。
 * - 認証必須（RLSにより自分の応募のみ保存可）。
 * - **公開中(`status='published'`)の求人にしか応募できない。** 表示側は公開中しか出さないが、
 *   このAPIを直接叩けば下書き・停止中の求人にも応募できてしまうため、ここでも確かめる。
 * - 重複応募（unique(member_id, job_id) 違反 = 23505）は冪等に成功扱い。
 *   → **通知メールは (会員, 求人) の組ごとに1通**になる（DBの一意制約が保証）。
 * - 新規応募が保存できたときだけスタッフへ通知メールを送る（通知失敗は応募を失敗させない）。
 * - Issue #30: 会員あたりの回数制限と Origin 検証を追加（存在しない求人IDへの連投などを抑止）。
 */
export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return fail(403, "forbidden", "apply.fail.generic");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail(401, "unauthorized", "apply.fail.expired");
  }

  const verdict = await consumeRateLimit({
    key: `applications:${user.id}`,
    limit: APPLY_LIMIT,
    windowSec: APPLY_WINDOW_SEC,
  });
  if (!verdict.allowed) {
    return fail(429, "rate limited", "apply.fail.tooMany", {
      "Retry-After": String(verdict.retryAfterSec),
    });
  }

  const body = (await req.json().catch(() => null)) as { job_id?: unknown } | null;
  const jobId = Number(body?.job_id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return fail(400, "invalid job_id", "apply.fail.generic");
  }

  // 応募の可否の判定と、通知メールに載せる求人情報の取得を1回のクエリで兼ねる。
  // 存在しない / 下書き / 停止中 は **区別せず** 同じ応答にする
  //（RLS `jobs_read_published` が既にこの区別を隠しているので、分けると情報が増えてしまう）。
  const { data: job } = await supabase
    .from("jobs")
    .select(JOB_COLS)
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();
  if (!job) {
    return fail(409, "job unavailable", "apply.fail.closed");
  }

  const { error } = await supabase.from("applications").insert({ member_id: user.id, job_id: jobId });
  if (error) {
    if (error.code === "23505") {
      // 既に応募済み。冪等に成功扱いとし、通知は送らない。
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[applications] insert error:", error);
    // 42501 = RLSに拒否された。会員から見れば「もう応募を受け付けていない」と同じ意味。
    const key = error.code === "42501" ? "apply.fail.closed" : "apply.fail.generic";
    return fail(400, "insert failed", key);
  }

  // 新規応募 → スタッフへ通知。通知の失敗で応募自体は失敗させない。
  try {
    const { data: member } = await supabase
      .from("members")
      .select(MEMBER_NOTIFY_COLS)
      .eq("id", user.id)
      .maybeSingle();
    if (member) {
      await notifyNewApplication(member as MemberInfo, job as JobInfo, new URL(req.url).origin);
    }
  } catch (e) {
    console.error("[applications] notify error:", e);
  }

  return NextResponse.json({ ok: true });
}

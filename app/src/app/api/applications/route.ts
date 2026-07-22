import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewApplication, type JobInfo, type MemberInfo } from "@/lib/notify";

const MEMBER_COLS =
  "member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id, email, residence, jlpt";
const JOB_COLS = "id, title_ja, title_zh, area_ja, region";

/**
 * 応募API（POST /api/applications）。
 * - 認証必須（RLSにより自分の応募のみ保存可）。
 * - 重複応募（unique(member_id, job_id) 違反 = 23505）は冪等に成功扱い。
 * - 新規応募が保存できたときだけスタッフへ通知メールを送る（通知失敗は応募を失敗させない）。
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
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
      supabase.from("members").select(MEMBER_COLS).eq("id", user.id).maybeSingle(),
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

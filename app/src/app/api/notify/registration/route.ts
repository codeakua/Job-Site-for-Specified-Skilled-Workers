import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyNewRegistration, type MemberInfo } from "@/lib/notify";

const MEMBER_COLS =
  "member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id, email, residence, jlpt";

/**
 * 新規会員登録の通知API（POST /api/notify/registration）。
 * 登録直後にクライアントから呼ぶ。認証必須で、宛先や氏名はクライアント入力ではなく
 * 認証済みユーザーの members 行から読み取る（改ざん防止）。
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("members")
    .select(MEMBER_COLS)
    .eq("id", user.id)
    .maybeSingle();
  if (!member) {
    return NextResponse.json({ ok: false, error: "member not found" }, { status: 404 });
  }

  try {
    await notifyNewRegistration(member as MemberInfo, new URL(req.url).origin);
  } catch (e) {
    console.error("[notify/registration] error:", e);
  }
  return NextResponse.json({ ok: true });
}

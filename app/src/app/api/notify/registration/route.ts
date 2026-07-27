import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MEMBER_NOTIFY_COLS,
  REGISTRATION_NOTIFY_WINDOW_MIN,
  notifyNewRegistration,
  registrationNotifyRule,
  type MemberInfo,
} from "@/lib/notify";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/request";

/**
 * 新規会員登録の通知API（POST /api/notify/registration）。
 *
 * ⚠️ **現在の登録フローはこのAPIを呼ばない。**
 *    登録は `/api/auth/register` に集約され、通知もその中で1回だけ送っている
 *    （members の主キーは auth.users.id なので、insert が成功するのは会員あたり生涯1回＝
 *     構造的に1通しか飛ばない）。
 *    このAPIは、デプロイ直後にブラウザのキャッシュに残った**古い画面**からの呼び出しを
 *    受け止めるために残してある。将来、古い画面が居なくなったら削除してよい。
 *
 * 認証必須で、宛先や氏名はクライアント入力ではなく認証済みユーザーの members 行から読み取る
 * （改ざん防止）。以前は**回数制限が無く、ログインさえしていれば何通でもスタッフ宛に
 * メールを送れた**（メール爆撃）。Issue #30 で下の2段の制限を追加した。
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

  const { data: member } = await supabase
    .from("members")
    .select(`${MEMBER_NOTIFY_COLS}, created_at`)
    .eq("id", user.id)
    .maybeSingle();
  if (!member) {
    return NextResponse.json({ ok: false, error: "member not found" }, { status: 404 });
  }

  // ① 登録直後の窓の外なら、無条件で送らない（ストアに依存しない上限）。
  //
  //    これが**回数制限の本体**である。会員が「登録した直後」以外にこのAPIを叩いても、
  //    ストア（Upstash/インメモリ）の状態に関係なく必ず送信されない。
  //    インメモリのカウンタはインスタンス間で共有されないため単独では上限にならないが、
  //    この窓は members.created_at というDBの事実に基づくので、どのインスタンスでも同じ判定になる。
  const createdAt = Date.parse((member as { created_at?: string }).created_at ?? "");
  const fresh =
    Number.isFinite(createdAt) &&
    Date.now() - createdAt <= REGISTRATION_NOTIFY_WINDOW_MIN * 60_000;
  if (!fresh) {
    return NextResponse.json({ ok: true, skipped: "stale" });
  }

  // ② 窓の中でも会員あたり1回だけ。
  //    **`/api/auth/register` が通知を送るときに同じキーを消費している**ので、
  //    そちらで登録した会員がこのAPIを叩いても2通目にはならない。
  const verdict = await consumeRateLimit(registrationNotifyRule(user.id));
  if (!verdict.allowed) {
    return NextResponse.json({ ok: true, skipped: "duplicate" });
  }

  try {
    await notifyNewRegistration(member as unknown as MemberInfo, new URL(req.url).origin);
  } catch (e) {
    console.error("[notify/registration] error:", e);
  }
  return NextResponse.json({ ok: true });
}

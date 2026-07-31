import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 管理画面のスタッフ判定（DAL: Data Access Layer）。
 * React cache() により同一リクエスト内では1回しか照会されないため、
 * layout（表示の門番）と各 page（データの門番）の両方から呼んでもクエリは増えない。
 * ※ layout はクライアント遷移で再実行されないため、layout だけに頼らず各ページでも必ず呼ぶこと。
 * ※ Server Action への明示チェック追加は Issue #28（requireStaff() を冒頭で1行呼ぶだけ）。
 *
 * `unavailable` は「スタッフでない」ではなく「**判定できなかった**」ことを表す。
 * Supabaseへ届かないときも従来は `staff: null` になり、スタッフに
 * 「権限がありません」と表示されていた。原因が正反対なので画面も分ける。
 */
export const getStaffContext = cache(async () => {
  const supabase = await createClient();
  try {
    const { data, error: userError } = await supabase.auth.getUser();
    // セッションが無いだけ（＝ログアウト状態）は「判定できた」うえでの非スタッフ。
    // @supabase/auth-js の isAuthSessionMissingError と同じ判定（ライブラリ自身も name で見ている）。
    if (userError && userError.name !== "AuthSessionMissingError") {
      console.error("[admin/guard] getUser error:", userError);
      return { user: null, staff: null, unavailable: true };
    }
    const user = data.user;
    if (!user) return { user: null, staff: null, unavailable: false };

    const { data: staff, error: staffError } = await supabase
      .from("staff_users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (staffError) {
      console.error("[admin/guard] staff_users error:", staffError);
      return { user, staff: null, unavailable: true };
    }
    return { user, staff: staff ?? null, unavailable: false };
  } catch (e) {
    console.error("[admin/guard] unexpected error:", e);
    return { user: null, staff: null, unavailable: true };
  }
});

/** スタッフなら context を、非スタッフ/未ログイン/判定不能なら null を返す。 */
export async function requireStaff() {
  const ctx = await getStaffContext();
  return ctx.staff ? ctx : null;
}

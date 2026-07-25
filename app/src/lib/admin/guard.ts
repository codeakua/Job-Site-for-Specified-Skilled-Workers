import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * 管理画面のスタッフ判定（DAL: Data Access Layer）。
 * React cache() により同一リクエスト内では1回しか照会されないため、
 * layout（表示の門番）と各 page（データの門番）の両方から呼んでもクエリは増えない。
 * ※ layout はクライアント遷移で再実行されないため、layout だけに頼らず各ページでも必ず呼ぶこと。
 * ※ Server Action への明示チェック追加は Issue #28（requireStaff() を冒頭で1行呼ぶだけ）。
 */
export const getStaffContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, staff: null };
  const { data: staff } = await supabase
    .from("staff_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return { user, staff: staff ?? null };
});

/** スタッフなら context を、非スタッフ/未ログインなら null を返す。 */
export async function requireStaff() {
  const ctx = await getStaffContext();
  return ctx.staff ? ctx : null;
}

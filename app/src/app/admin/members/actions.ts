"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * WeChat本人確認済みフラグの切替。
 * アクション内の明示スタッフチェックを既に持つ唯一のServer Action（是正④ #28 の流用元パターン）。
 * この二重チェックは退行させないこと。
 */
export async function toggleVerified(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const nextVerified = String(formData.get("next_verified") ?? "false") === "true";
  if (!id) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: staff } = await supabase.from("staff_users").select("id").eq("id", user?.id ?? "").maybeSingle();
  if (!staff) return;
  await supabase.from("members").update({ verified: nextVerified }).eq("id", id);
  revalidatePath("/admin/members");
  revalidatePath("/admin");
}

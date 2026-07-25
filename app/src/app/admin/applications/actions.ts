"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin/labels";

async function saveApplicationStatus(id: number, status: ApplicationStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) console.error("[admin/applications] ステータス保存に失敗:", error);
}

/**
 * スタッフ内部メモの保存（是正① #25）。
 * 会員に読まれないよう、メモは applications ではなく staff限定RLSの
 * application_staff_notes に置いてある（会員が直接クエリしても0行）。
 * 空にしたときは行ごと削除して、空メモの行を残さない。
 */
async function saveApplicationNote(id: number, note: string | null) {
  const supabase = await createClient();
  const { error } =
    note === null
      ? await supabase.from("application_staff_notes").delete().eq("application_id", id)
      : await supabase
          .from("application_staff_notes")
          .upsert({ application_id: id, note }, { onConflict: "application_id" });
  if (error) console.error("[admin/applications] メモ保存に失敗:", error);
}

/** 応募のステータス＋スタッフメモ更新。 */
export async function updateApplication(formData: FormData) {
  // 是正④ #28: RLS任せにせずアクション単体でも fail-closed にする。
  if (!(await requireStaff())) return;

  const id = Number(String(formData.get("id") ?? "").trim());
  const status = String(formData.get("status") ?? "new") as ApplicationStatus;
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!Number.isSafeInteger(id) || id <= 0) return;
  if (!APPLICATION_STATUSES.includes(status)) return;

  await saveApplicationStatus(id, status);
  await saveApplicationNote(id, note);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  revalidatePath("/mypage");
}

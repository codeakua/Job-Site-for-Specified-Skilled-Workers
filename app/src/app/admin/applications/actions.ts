"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin/labels";

// 内部を「ステータス保存」と「メモ保存」の2関数に分割してある。
// 是正① #25 で staff_note を別テーブル（application_staff_notes）へ移す際、
// saveApplicationNote の実装差し替えだけで済むようにするための準備。

async function saveApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = await createClient();
  await supabase.from("applications").update({ status }).eq("id", id);
}

async function saveApplicationNote(id: string, note: string | null) {
  const supabase = await createClient();
  await supabase.from("applications").update({ staff_note: note }).eq("id", id);
}

/** 応募のステータス＋スタッフメモ更新。 */
export async function updateApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "new") as ApplicationStatus;
  const note = String(formData.get("staff_note") ?? "").trim() || null;
  if (!id || !APPLICATION_STATUSES.includes(status)) return;
  await saveApplicationStatus(id, status);
  await saveApplicationNote(id, note);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  revalidatePath("/mypage");
}

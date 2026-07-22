import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ApplicationsManager, type AdminApplication } from "./ApplicationsManager";

type ApplicationStatus = "new" | "contacted" | "interview" | "offer" | "hired" | "declined";
const statuses: ApplicationStatus[] = ["new", "contacted", "interview", "offer", "hired", "declined"];

async function updateApplication(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "new") as ApplicationStatus;
  const staff_note = String(formData.get("staff_note") ?? "").trim() || null;
  if (!id || !statuses.includes(status)) return;
  await supabase.from("applications").update({ status, staff_note }).eq("id", id);
  revalidatePath("/admin/applications");
  revalidatePath("/mypage");
}

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: staff } = await supabase.from("staff_users").select("id").eq("id", user?.id ?? "").maybeSingle();
  if (!staff) return <main className="shell"><section className="empty"><div className="e-emoji">🔒</div><h3>権限がありません</h3><p>管理画面はスタッフ本人のみ利用できます。</p></section></main>;
  const { data } = await supabase.from("applications").select("id, status, staff_note, created_at, updated_at, members(id, member_no, last_name, first_name, pinyin, phone_code, phone, wechat_id), jobs(id, title_ja, area_ja)").order("updated_at", { ascending: false });
  return <ApplicationsManager applications={(data ?? []) as unknown as AdminApplication[]} updateApplication={updateApplication} />;
}

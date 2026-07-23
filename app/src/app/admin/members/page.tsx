import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MembersManager, type AdminMember } from "./MembersManager";

async function toggleVerified(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const nextVerified = String(formData.get("next_verified") ?? "false") === "true";
  if (!id) return;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: staff } = await supabase.from("staff_users").select("id").eq("id", user?.id ?? "").maybeSingle();
  if (!staff) return;
  await supabase.from("members").update({ verified: nextVerified }).eq("id", id);
  revalidatePath("/admin/members");
}

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: staff } = await supabase.from("staff_users").select("id").eq("id", user?.id ?? "").maybeSingle();
  if (!staff) return <main className="shell"><section className="empty"><div className="e-emoji">🔒</div><h3>権限がありません</h3><p>管理画面はスタッフ本人のみ利用できます。</p></section></main>;

  const { data } = await supabase
    .from("members")
    .select("id, member_no, last_name, first_name, pinyin, birth, gender, nationality, residence, address, phone_code, phone, wechat_id, email, jlpt, ssw_fields, other_qual, verified, created_at, updated_at")
    .order("created_at", { ascending: false });

  return <MembersManager members={(data ?? []) as AdminMember[]} toggleVerified={toggleVerified} />;
}

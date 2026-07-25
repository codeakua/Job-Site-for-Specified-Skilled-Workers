import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/admin/guard";
import { AdminDenied } from "../AdminDenied";
import { MembersTable, type AdminMember } from "./MembersTable";
import { toggleVerified } from "./actions";

/** 会員管理: 一覧（テーブル＋行展開で全項目）・検索・verified切替。 */
export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
  if (!(await requireStaff())) return <AdminDenied />;
  const { verified } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("members")
    .select(
      "id, member_no, last_name, first_name, pinyin, birth, gender, nationality, residence, address, phone_code, phone, wechat_id, email, jlpt, ssw_fields, other_qual, verified, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const initialVerified = verified === "verified" || verified === "unverified" ? verified : "all";

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>会員管理</h1>
          <p className="admin-page-desc">登録会員の情報を確認し、WeChatで本人確認のうえ「確認済み」に切り替えます。</p>
        </div>
      </header>
      {/* key: ダッシュボードのショートカットで初期フィルタが変わったとき再マウントさせる */}
      <MembersTable
        key={initialVerified}
        members={(data ?? []) as AdminMember[]}
        toggleVerified={toggleVerified}
        initialVerified={initialVerified}
      />
    </>
  );
}

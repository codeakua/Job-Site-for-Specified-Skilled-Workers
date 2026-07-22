import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 では middleware は「proxy」に改称された（機能は同じ）。
// Supabaseのセッション更新とログインガードを毎リクエストで行う。
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 静的アセット・画像・favicon を除く全パスに適用。
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

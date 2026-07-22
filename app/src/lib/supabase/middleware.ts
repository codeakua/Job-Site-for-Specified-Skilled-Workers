import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ログイン必須のパス（未ログインならログインへ誘導）。会員エリアと詳細。
const PROTECTED = ["/jobs", "/job", "/favs", "/mypage", "/admin"];

/**
 * Supabaseのセッション(cookie)を毎リクエストで更新し、
 * 保護対象パスに未ログインでアクセスした場合はログインへリダイレクトする。
 * proxy.ts（Next.js 16の旧middleware）から呼ばれる。
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() でセッションを検証・更新（getSession ではなく getUser を使うのが安全）。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (needsAuth && !user) {
    // β版では会員・スタッフとも同じ /login からログインする（管理画面は入室後に権限確認）。
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}

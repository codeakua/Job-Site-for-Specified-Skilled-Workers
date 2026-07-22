import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ（クライアントコンポーネント）用のSupabaseクライアント。
 * 公開鍵（anon key）のみを使う。実際の値は .env.local / Vercel の環境変数から読む。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

// T-03: ログイン（電話番号＋パスワード）。
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل دخولك إلى خليل للوصول إلى لوحة الإدارة.",
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children;
}

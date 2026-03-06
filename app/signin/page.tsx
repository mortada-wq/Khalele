"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const rawInviteToken = searchParams.get("invite") || "";

  const [isSignUp, setIsSignUp] = useState(!!rawInviteToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [inviteToken, setInviteToken] = useState("");
  const [inviterName, setInviterName] = useState("");
  const [inviteChecked, setInviteChecked] = useState(!rawInviteToken);

  // Validate invite token from URL
  useEffect(() => {
    if (!rawInviteToken) return;
    fetch(`/api/invites/${rawInviteToken}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setInviteToken(rawInviteToken);
          setInviterName(data.inviterName);
          setEmail(data.inviteeEmail);
          setIsSignUp(true);
        }
      })
      .catch(() => {/* ignore — fall back to normal signup */})
      .finally(() => setInviteChecked(true));
  }, [rawInviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, inviteToken: inviteToken || undefined }),
      });

      if (res.ok) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push(callbackUrl);
        } else {
          setError("حدث خطأ في تسجيل الدخول");
        }
      } else {
        const data = await res.json();
        setError(data.error || "حدث خطأ في إنشاء الحساب");
      }
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    }

    setLoading(false);
  };

  if (!inviteChecked) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center" dir="rtl" style={{ background: "#ebebec" }}>
      <div className="w-full max-w-sm mx-4">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div style={{ width: "min(50vw, 200px)" }}>
            <img src="/logo/logo_black.svg" alt="خليل" className="w-full h-auto" />
          </div>

          {/* Invite banner */}
          {inviterName && (
            <div
              className="w-full rounded-xl px-4 py-3 text-center"
              style={{
                background: "#fff8e6",
                border: "1px solid #f0d98a",
                color: "#7a5c00",
              }}
            >
              <p className="font-ui text-sm" style={{ lineHeight: 1.7 }}>
                دعاك <strong>{inviterName}</strong> للانضمام إلى خليل
              </p>
            </div>
          )}

          <p className="font-ui text-sm text-center" style={{ color: "#6b6b6b", lineHeight: 1.8 }}>
            {isSignUp ? "إنشاء حساب جديد" : "سجّل الدخول للمتابعة"}
          </p>

          <div className="w-full flex flex-col gap-3">
            {isSignUp && (
              <input
                type="text"
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg font-ui text-sm"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  color: "#1f1f1f",
                }}
              />
            )}

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg font-ui text-sm"
              style={{
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                color: "#1f1f1f",
              }}
            />

            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg font-ui text-sm"
              style={{
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                color: "#1f1f1f",
              }}
            />

            {error && (
              <p className="font-ui text-xs text-center" style={{ color: "#d32f2f" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-full font-ui text-sm font-medium transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "#1f1f1f",
                color: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {loading ? "جاري التحميل..." : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="font-ui text-xs"
            style={{ color: "#6b6b6b" }}
          >
            {isSignUp ? "لديك حساب؟ سجّل الدخول" : "ليس لديك حساب؟ أنشئ حسابًا"}
          </button>

          <p className="font-ui text-xs text-center" style={{ color: "#999", lineHeight: 1.7 }}>
            بتسجيل الدخول، توافق على{" "}
            <a
              href="/tahseen-khaleel#privacy-terms"
              target="_blank"
              className="underline hover:opacity-70"
              style={{ color: "var(--color-accent)" }}
            >
              شروط الاستخدام وسياسة الخصوصية
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
          <span style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

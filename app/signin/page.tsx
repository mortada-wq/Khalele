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
      .catch(() => {})
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
        const result = await signIn("credentials", { email, password, redirect: false });
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
      const result = await signIn("credentials", { email, password, redirect: false });
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
      <div className="h-screen flex items-center justify-center" style={{ background: "#0c0c0e" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #C68E17", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="h-screen flex" style={{ background: "#0c0c0e" }}>

      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: "44%",
          background: "#0f0f11",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gold glow top-right */}
        <div style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,142,23,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Gold glow bottom-left */}
        <div style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,142,23,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Dot grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <img src="/logo/logo_white.png" alt="خليل" style={{ height: 36, objectFit: "contain" }}
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fallback = document.createElement("span");
              fallback.textContent = "خليل";
              fallback.style.cssText = "font-size:28px;font-weight:700;color:#fff;font-family:var(--font-ui)";
              t.parentNode?.appendChild(fallback);
            }}
          />
        </div>

        {/* Main copy */}
        <div style={{ position: "relative", zIndex: 1 }} dir="rtl">
          <div
            style={{
              display: "inline-block",
              background: "rgba(198,142,23,0.12)",
              border: "1px solid rgba(198,142,23,0.3)",
              borderRadius: 100,
              padding: "5px 14px",
              marginBottom: 24,
            }}
          >
            <span style={{ color: "#C68E17", fontSize: 12, fontFamily: "var(--font-ui)" }}>
              ذكاء اصطناعي بلهجتك
            </span>
          </div>

          <h1 style={{
            color: "#ffffff",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 700,
            fontFamily: "var(--font-ui)",
            lineHeight: 1.4,
            marginBottom: 16,
          }}>
            تحدّث مع خليل<br />
            <span style={{ color: "#C68E17" }}>بلهجتك أنت</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 15,
            fontFamily: "var(--font-ui)",
            lineHeight: 1.9,
            maxWidth: 340,
          }}>
            مساعد ذكي يفهم العربية بكل لهجاتها — العراقية، المصرية، الشامية والمزيد.
          </p>
        </div>

        {/* Bottom quote */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: 32, height: 1, background: "rgba(198,142,23,0.5)", marginBottom: 16 }} />
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "var(--font-ui)" }} dir="rtl">
            تجربة محادثة عربية حقيقية
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: "32px 24px" }}
        dir="rtl"
      >
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Mobile-only logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <img src="/logo/logo_white.png" alt="خليل" style={{ height: 32, objectFit: "contain" }}
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
              }}
            />
          </div>

          {/* Invite banner */}
          {inviterName && (
            <div
              style={{
                background: "rgba(198,142,23,0.10)",
                border: "1px solid rgba(198,142,23,0.25)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <p style={{ color: "#C68E17", fontSize: 13, fontFamily: "var(--font-ui)", lineHeight: 1.7, margin: 0 }}>
                دعاك <strong style={{ color: "#d4a030" }}>{inviterName}</strong> للانضمام إلى خليل
              </p>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "var(--font-ui)",
              margin: "0 0 6px",
            }}>
              {isSignUp ? "إنشاء حساب" : "مرحباً بك"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "var(--font-ui)", margin: 0 }}>
              {isSignUp ? "أدخل بياناتك للبدء" : "سجّل الدخول للمتابعة"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isSignUp && (
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                  الاسم
                </label>
                <input
                  type="text"
                  placeholder="اسمك الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontFamily: "var(--font-ui)",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(198,142,23,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(198,142,23,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "var(--font-ui)", marginBottom: 6 }}>
                كلمة المرور
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(198,142,23,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(220,53,53,0.1)",
                border: "1px solid rgba(220,53,53,0.25)",
                borderRadius: 8,
                padding: "10px 14px",
              }}>
                <p style={{ color: "#f87171", fontSize: 13, fontFamily: "var(--font-ui)", margin: 0 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 10,
                background: loading ? "rgba(198,142,23,0.5)" : "linear-gradient(135deg, #C68E17 0%, #a87212 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "var(--font-ui)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                transition: "opacity 0.2s, transform 0.1s",
                boxShadow: loading ? "none" : "0 4px 16px rgba(198,142,23,0.3)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.99)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading
                ? "جاري التحميل..."
                : isSignUp ? "إنشاء الحساب" : "تسجيل الدخول"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontFamily: "var(--font-ui)" }}>أو</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Toggle */}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {isSignUp ? "لديك حساب؟ سجّل الدخول" : "ليس لديك حساب؟ أنشئ حسابًا"}
          </button>

          {/* Privacy */}
          <p style={{
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            fontFamily: "var(--font-ui)",
            textAlign: "center",
            lineHeight: 1.8,
            marginTop: 24,
          }}>
            بالمتابعة توافق على{" "}
            <a
              href="/tahseen-khaleel#privacy-terms"
              target="_blank"
              style={{ color: "rgba(198,142,23,0.7)", textDecoration: "underline" }}
            >
              شروط الاستخدام وسياسة الخصوصية
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center" style={{ background: "#0c0c0e" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #C68E17", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

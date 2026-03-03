"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.09l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.749 10.749 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type Mode = "signin" | "signup";

function AuthContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
  }, []);

  const toggleMode = useCallback(() => {
    resetForm();
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
  }, [resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "حدث خطأ غير متوقع");
          setLoading(false);
          return;
        }

        setSuccess("تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...");

        await new Promise((r) => setTimeout(r, 800));
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          window.location.href = callbackUrl;
        } else {
          setSuccess("");
          setMode("signin");
          setError("تم إنشاء الحساب. سجّل الدخول الآن.");
        }
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("البريد أو كلمة المرور غير صحيحة");
        } else if (result?.ok) {
          window.location.href = callbackUrl;
        }
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl });
  };

  const isSignUp = mode === "signup";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      dir="rtl"
      style={{ background: "var(--bg-secondary)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/logo/logo_black.svg"
            alt="خليلي"
            className="h-12 w-auto logo-theme"
          />
        </motion.div>

        {/* Card */}
        <motion.div
          layout
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--bg-primary)",
            boxShadow: "0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        >
          {/* Mode Toggle */}
          <div
            className="flex rounded-full p-1 mb-6"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { if (m !== mode) toggleMode(); }}
                className="flex-1 py-2 rounded-full font-ui text-sm font-medium transition-all duration-200 relative"
                style={{
                  color: mode === m ? "var(--text-primary)" : "var(--text-tertiary)",
                  background: mode === m ? "var(--bg-primary)" : "transparent",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {m === "signin" ? "تسجيل الدخول" : "حساب جديد"}
              </button>
            ))}
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div
                  className="rounded-xl px-4 py-3 font-ui text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    color: "#dc2626",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  {error}
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div
                  className="rounded-xl px-4 py-3 font-ui text-sm"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    color: "#059669",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block font-ui text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    required={isSignUp}
                    className="w-full rounded-xl px-4 py-3 font-ui text-sm outline-none transition-all duration-150"
                    style={{
                      background: "var(--bg-input)",
                      color: "var(--text-primary)",
                      border: "1px solid transparent",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-accent-tint-12)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block font-ui text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                dir="ltr"
                className="w-full rounded-xl px-4 py-3 font-ui text-sm outline-none transition-all duration-150"
                style={{
                  background: "var(--bg-input)",
                  color: "var(--text-primary)",
                  border: "1px solid transparent",
                  textAlign: "left",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-accent-tint-12)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label className="block font-ui text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "6 أحرف على الأقل" : "••••••••"}
                  required
                  minLength={isSignUp ? 6 : undefined}
                  dir="ltr"
                  className="w-full rounded-xl px-4 py-3 pl-11 font-ui text-sm outline-none transition-all duration-150"
                  style={{
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    border: "1px solid transparent",
                    textAlign: "left",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-accent-tint-12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg transition-colors duration-150"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-tertiary)"; }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-ui text-sm font-semibold transition-all duration-200 mt-2"
              style={{
                background: "var(--color-accent)",
                color: "#fff",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--color-accent-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--color-accent)"; }}
            >
              {loading ? (
                <SpinnerIcon />
              ) : isSignUp ? (
                "إنشاء الحساب"
              ) : (
                "تسجيل الدخول"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--bg-tertiary)" }} />
            <span className="font-ui text-xs" style={{ color: "var(--text-tertiary)" }}>
              أو
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--bg-tertiary)" }} />
          </div>

          {/* Google Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-ui text-sm font-medium transition-all duration-200"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid rgba(0,0,0,0.06)",
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-tertiary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-input)"; }}
          >
            {googleLoading ? <SpinnerIcon /> : <GoogleIcon />}
            <span>المتابعة مع Google</span>
          </motion.button>

          {/* Toggle Link */}
          <p className="text-center mt-5 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
            {isSignUp ? "عندك حساب؟" : "ما عندك حساب؟"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold transition-colors duration-150"
              style={{ color: "var(--color-accent)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
            >
              {isSignUp ? "سجّل دخولك" : "أنشئ حساب"}
            </button>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center mt-5 font-ui text-xs" style={{ color: "var(--text-tertiary)", lineHeight: 1.7 }}>
          بالمتابعة، توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}

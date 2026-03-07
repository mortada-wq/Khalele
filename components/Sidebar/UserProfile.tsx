"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ProfileIcon } from "../Icons/ProfileIcon";

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error || "حدث خطأ");
        setStatus("error");
      }
    } catch {
      setErrorMsg("حدث خطأ في الاتصال");
      setStatus("error");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
        style={{ background: "rgba(0,0,0,0.4)" }}
      />
      <div
        className="fixed z-40 rounded-2xl p-5 w-80"
        dir="rtl"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          bottom: "80px",
          left: "16px",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-ui)" }}
          >
            دعوة صديق
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <div className="text-center py-3">
            <p style={{ color: "#6fcf97", fontFamily: "var(--font-ui)", fontSize: "14px" }}>
              تم إرسال الدعوة بنجاح ✓
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="البريد الإلكتروني للصديق"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                outline: "none",
              }}
            />
            {status === "error" && (
              <p style={{ color: "#eb5757", fontSize: "12px", fontFamily: "var(--font-ui)" }}>
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                background: "#ffffff",
                color: "#1f1f1f",
                fontFamily: "var(--font-ui)",
              }}
            >
              {status === "loading" ? "جاري الإرسال..." : "أرسل الدعوة"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export function UserProfile({ expanded }: { expanded: boolean }) {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  if (status === "loading") {
    return null;
  }

  // Show guest profile when not logged in
  const isGuest = !session?.user;
  const userName = session?.user?.name || session?.user?.email || "ضيف";
  const userEmail = session?.user?.email;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center transition-opacity"
        style={{
          opacity: showMenu ? 1 : 0.7,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!showMenu) e.currentTarget.style.opacity = "0.7";
        }}
        title={userName}
      >
        <ProfileIcon size={32} className="text-white" />
      </button>
    );
  }

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="w-full flex items-center gap-3 transition-opacity"
          style={{
            opacity: showMenu ? 1 : 0.7,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            if (!showMenu) e.currentTarget.style.opacity = "0.7";
          }}
        >
          <span className="shrink-0" style={{ border: isGuest ? "1px solid rgba(255,255,255,0.3)" : "1px solid #C68E17", borderRadius: "50%", padding: "2px", display: "inline-flex" }}>
            <ProfileIcon size={40} className={isGuest ? "text-gray-400" : "text-white"} />
          </span>
          <div className="flex-1 text-right overflow-hidden">
            <div
              className="font-medium text-sm truncate"
              style={{
                color: isGuest ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 1)",
                fontFamily: "var(--font-ui)",
                fontWeight: 400,
              }}
            >
              {userName}
            </div>
            {userEmail ? (
              <div
                className="text-xs truncate"
                style={{
                  color: "rgba(255, 255, 255, 0.4)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "11px",
                }}
              >
                {userEmail}
              </div>
            ) : (
              <div
                className="text-xs"
                style={{
                  color: "rgba(255, 255, 255, 0.3)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "11px",
                }}
              >
                الوضع المجاني
              </div>
            )}
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div
              className="absolute bottom-full left-0 right-0 mb-2 rounded-lg overflow-hidden z-20"
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              {isGuest ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      window.location.href = "/signin";
                    }}
                    className="w-full px-4 py-3 text-sm text-right transition-all"
                    style={{
                      color: "#C68E17",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 300,
                      backgroundColor: "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.1)";
                      e.currentTarget.style.color = "#C68E17";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#C68E17";
                    }}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      window.location.href = "/signup";
                    }}
                    className="w-full px-4 py-3 text-sm text-right transition-all"
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 300,
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                  >
                    إنشاء حساب
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowInvite(true);
                    }}
                    className="w-full px-4 py-3 text-sm text-right transition-all"
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 300,
                      backgroundColor: "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                  >
                    دعوة صديق
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      signOut({ callbackUrl: "/signin" });
                    }}
                    className="w-full px-4 py-3 text-sm text-right transition-all"
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 300,
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

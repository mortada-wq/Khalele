"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HomePillInput } from "@/components/HomePillInput";
import { BirdToggle } from "@/components/BirdToggle";

const DEFAULT_TAGLINE = "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالعربية السهلة";
const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;

function UserAvatarIcon() {
  return (
    <svg viewBox="0 0 33.5 39.75" width="30" height="36" aria-hidden>
      <defs>
        <linearGradient id="home-avatar-stroke" x1="0" y1="19.87" x2="33.5" y2="19.87" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5e5e5e" stopOpacity="0" />
          <stop offset="1" stopColor="#ebebec" />
        </linearGradient>
      </defs>
      <circle fill="#7a5a20" cx="16.75" cy="17.55" r="5.83" />
      <path
        stroke="url(#home-avatar-stroke)"
        strokeMiterlimit="10"
        strokeWidth=".28"
        fill="none"
        d="M28.59,9.99c-2.88-3.56-6.76-6.48-10.76-9.49-.64-.48-1.52-.48-2.16,0C7.69,6.52.15,12.2.15,23.26c-.14,4.32,1.46,8.52,4.46,11.64.23.23.45.45.7.66,2.81,2.37,6.31,3.77,9.98,3.97.98.02,1.95.04,2.93.06h0c3.67-.22,7.17-1.61,9.98-3.99,3.38-2.97,5.16-7.24,5.16-12.33,0-5.55-1.88-9.74-4.77-13.3ZM27.41,31.2c-.29.38-.61.74-.95,1.07-1.78-5.35-7.56-8.25-12.91-6.47-2.87.95-5.17,3.13-6.28,5.95-.52-.48-.99-1.01-1.39-1.58-1.89-3.07-2.55-6.74-1.84-10.28,1.18-6.28,5.76-10.43,12.72-15.7,8.13,6.18,13.02,10.81,13.02,19.04.11,2.85-.72,5.65-2.36,7.97Z"
      />
    </svg>
  );
}

export function HomeHero() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/taglines/active");
        if (!res.ok) return;
        const data = (await res.json()) as { tagline?: string };
        if (!canceled && data.tagline?.trim()) {
          const t = data.tagline.trim();
          if (/[\u0600-\u06FF]/.test(t)) setTagline(t);
        }
      } catch {
        /* keep default */
      }
    };
    void load();
    return () => { canceled = true; };
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ m: trimmed });
    if (incognitoMode) params.set("incognito", "1");
    router.push(`/chat?${params.toString()}`);
  };

  const handleMicTranscript = (text: string) => {
    if (!text.trim()) return;
    const params = new URLSearchParams({ m: text.trim() });
    if (incognitoMode) params.set("incognito", "1");
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <div className="h-[100dvh] flex overflow-hidden" dir="rtl" style={{ background: "#ebebec" }}>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex relative shrink-0 flex-col"
        style={{
          width: sidebarExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: sidebarExpanded ? "#ffffff" : "#ebebec",
          borderTopLeftRadius: sidebarExpanded ? 20 : 0,
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Bird toggle */}
        <div className="shrink-0" style={{ height: 72 }}>
          <button
            onClick={() => setSidebarExpanded((p) => !p)}
            className="absolute flex items-center justify-center"
            style={{ top: 0, right: 0, width: SIDEBAR_W_COLLAPSED, height: 72 }}
            aria-label={sidebarExpanded ? "طي القائمة" : "فتح القائمة"}
          >
            <BirdToggle expanded={sidebarExpanded} />
          </button>
        </div>

        {/* Sidebar content — only visible when expanded */}
        {sidebarExpanded && (
          <div className="flex-1 min-h-0 px-3 py-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
              style={{ color: "#000000" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>ابدأ محادثة</span>
            </button>
          </div>
        )}

        {/* Bottom: user avatar */}
        <div
          className="shrink-0 flex items-center pb-4 pt-2"
          style={sidebarExpanded
            ? { borderTop: "1px solid #efefef", paddingInline: 12 }
            : { justifyContent: "center", width: SIDEBAR_W_COLLAPSED }
          }
        >
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors p-1"
            aria-label="الحساب والإعدادات"
          >
            <UserAvatarIcon />
          </button>
        </div>
      </aside>

      {/* ── Mobile bird toggle ── */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 z-50 flex items-center justify-center p-3 rounded-xl bg-transparent border-none shadow-none hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
        style={{ right: 12 }}
        aria-label="فتح القائمة"
      >
        <BirdToggle expanded={false} size={40} />
      </button>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[min(280px,80vw)] flex flex-col"
              style={{ background: "#ffffff", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}
            >
              <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 -m-2 rounded-lg hover:bg-black/5"
                  aria-label="إغلاق"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <span className="font-ui font-semibold" style={{ color: "#000000" }}>القائمة</span>
                <div className="w-10" />
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <button
                  type="button"
                  onClick={() => { setMobileSidebarOpen(false); router.push("/chat"); }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
                  style={{ color: "#000000" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>ابدأ محادثة</span>
                </button>
              </div>
              <div className="shrink-0 p-4 border-t border-[#e5e5e5]">
                <button
                  onClick={() => { setMobileSidebarOpen(false); router.push("/chat"); }}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-black/5"
                  aria-label="الإعدادات"
                >
                  <UserAvatarIcon />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content — pushes and centers with sidebar ── */}
      <main className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
        <div className="flex flex-col items-center w-full px-6 max-w-xl">
          {/* Logo */}
          <img
            src="/logo/logo_light.png"
            alt="خليلي"
            className="w-40 md:w-56 h-auto mb-5"
            draggable={false}
            style={{ filter: "none" }}
          />

          {/* Tagline */}
          <p
            className="font-ui text-sm md:text-base text-center leading-relaxed mb-10"
            style={{ color: "#6b6b6b" }}
          >
            {tagline}
          </p>

          {/* Input bar */}
          <HomePillInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onVoiceMode={() => router.push("/chat?voice=1")}
            onMicTranscript={handleMicTranscript}
            onFiles={(files) => {
              const names = Array.from(files).map((f) => f.name).join("، ");
              setInput((prev) => (prev ? `${prev} ${names}` : names));
            }}
            incognitoMode={incognitoMode}
            onIncognitoChange={setIncognitoMode}
            placeholder="سلام عليكم.."
          />
        </div>
      </main>
    </div>
  );
}

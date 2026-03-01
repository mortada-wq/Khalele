"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HomePillInput } from "@/components/HomePillInput";
import { SettingsModal } from "@/components/Settings";
import { BirdToggle } from "@/components/BirdToggle";
/* ─── Sidebar section with definition and empty-state CTA ─── */
function SidebarSection({
  label,
  description,
  cta,
  isEmpty,
}: {
  label: string;
  description: string;
  cta: string;
  isEmpty: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#e5e5e5] p-3 bg-[#fafafa]">
      <button
        type="button"
        className="w-full text-right font-ui text-[#000000] hover:text-[var(--color-accent)] transition-colors text-sm font-medium mb-1"
      >
        {label}
      </button>
      <p className="text-right text-xs text-[#6b6b6b] leading-relaxed mb-2">
        {description}
      </p>
      {isEmpty && (
        <p className="text-right text-xs font-medium" style={{ color: "var(--color-accent)" }}>
          {cta}
        </p>
      )}
    </div>
  );
}

/* ─── User avatar – actual brand icon. Same place, different colors when sidebar in/out ─── */
function UserAvatarIcon({ expanded }: { expanded: boolean }) {
  const fillColor = expanded ? "var(--color-accent-avatar-expanded)" : "var(--color-accent-avatar-collapsed)";
  const strokeEnd = expanded ? "#fff" : "#ebebec";
  const gradientId = expanded ? "avatar-stroke-in" : "avatar-stroke-out";
  return (
    <svg viewBox="0 0 33.5 39.75" width="35" height="42" aria-hidden style={{ opacity: 0.65, textAlign: "center" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="19.87" x2="33.5" y2="19.87" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5e5e5e" stopOpacity="0"/>
          <stop offset="1" stopColor={strokeEnd}/>
        </linearGradient>
      </defs>
      <circle fill={fillColor} cx="16.75" cy="17.55" r="5.83"/>
      <path
        stroke={`url(#${gradientId})`}
        strokeMiterlimit="10"
        strokeWidth=".28"
        d="M28.59,9.99c-2.88-3.56-6.76-6.48-10.76-9.49-.64-.48-1.52-.48-2.16,0C7.69,6.52.15,12.2.15,23.26c-.14,4.32,1.46,8.52,4.46,11.64.23.23.45.45.7.66,2.81,2.37,6.31,3.77,9.98,3.97.98.02,1.95.04,2.93.06h0c3.67-.22,7.17-1.61,9.98-3.99,3.38-2.97,5.16-7.24,5.16-12.33,0-5.55-1.88-9.74-4.77-13.3ZM27.41,31.2c-.29.38-.61.74-.95,1.07-1.78-5.35-7.56-8.25-12.91-6.47-2.87.95-5.17,3.13-6.28,5.95-.52-.48-.99-1.01-1.39-1.58-1.89-3.07-2.55-6.74-1.84-10.28,1.18-6.28,5.76-10.43,12.72-15.7,8.13,6.18,13.02,10.81,13.02,19.04.11,2.85-.72,5.65-2.36,7.97Z"
      />
    </svg>
  );
}

/* ─── Tagline with "خليل" highlighted in gold ─── */
function Tagline({ text }: { text: string }) {
  const keyword = "خليل";
  const parts = text.split(keyword);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span style={{ color: "var(--color-accent)" }}>{keyword}</span>
          )}
        </span>
      ))}
    </>
  );
}

const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tagline, setTagline] = useState(
    "حضر الأصيل ..اشطبوا الوكلاء، تعرّف على خليل"
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const handleVoiceMode = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("khalele_open_call_mode", "1");
    }
    if (incognitoMode) {
      sessionStorage.setItem("khalele_incognito", "1");
    }
    router.push("/chat");
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const fetchTagline = () => {
      fetch("/api/taglines/active")
        .then((r) => r.json())
        .then((d) => {
          setTagline(
            d.tagline ?? "حضر الأصيل ..اشطبوا الوكلاء، تعرّف على خليل"
          );
          if (d.rotationEnabled && d.rotationIntervalMinutes) {
            const ms = d.rotationIntervalMinutes * 60 * 1000;
            timeoutId = setTimeout(fetchTagline, ms);
          }
        })
        .catch(() => {});
    };
    fetchTagline();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const encoded = encodeURIComponent(trimmed);
    if (incognitoMode && typeof window !== "undefined") {
      sessionStorage.setItem("khalele_incognito", "1");
    }
    router.push(`/chat?m=${encoded}`);
  };

  const handleTranscript = (text: string) => {
    if (text.trim()) setInput(text);
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      dir="rtl"
      style={{ background: "#ebebec" }}
    >
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: sidebarExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: sidebarExpanded ? "#ffffff" : "#ebebec",
          borderTopLeftRadius: sidebarExpanded ? 20 : 0,
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}
      >
        {/* Bird toggle – sticky top */}
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

        {/* Scrollable middle – seamless scrollbar */}
        <div className="flex-1 min-h-0">
          {sidebarExpanded ? (
            <nav className="sidebar-scroll h-full overflow-y-auto px-4 py-3 space-y-4" style={{ minHeight: 0 }}>
              <SidebarSection
                label="فهرس"
                description="أرشيف المحادثات. كل محادثاتك منظمة هنا."
                cta="لا توجد محادثات بعد — ابدأ محادثة جديدة!"
                isEmpty={true}
              />
              <SidebarSection
                label="خليخانة"
                description="مشاريعك وأعمالك. مثل المشاريع في ChatGPT أو Gen في Gemini."
                cta="أنشئ مشروعاً لتنظيم أفكارك"
                isEmpty={true}
              />
              <SidebarSection
                label="أدوات"
                description="مجموعة أدواتك وتطبيقاتك: موسيقى، توليد صور، والمزيد."
                cta="أضف الأدوات التي تريدها"
                isEmpty={true}
              />
            </nav>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Bottom bar – sticky, same location in/out. Profile opens settings (ChatGPT-style). */}
        <div className="shrink-0 flex flex-col items-center gap-2 pb-6 pt-2" style={{ width: SIDEBAR_W_COLLAPSED, marginInlineEnd: "auto" }}>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors p-2"
            aria-label="الحساب والإعدادات"
          >
            <UserAvatarIcon expanded={sidebarExpanded} />
          </button>
        </div>
      </aside>

      {/* Mobile menu - BirdToggle (same icon as desktop sidebar) */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 z-50 flex items-center justify-center p-3 rounded-xl bg-transparent border-none shadow-none hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
        style={{ right: 12 }}
        aria-label="فتح القائمة"
      >
        <BirdToggle expanded={false} size={40} />
      </button>

      {/* Mobile sidebar overlay */}
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
              className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[min(320px,85vw)] flex flex-col overflow-hidden"
              style={{ background: "#ffffff", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}
            >
              <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
                <button onClick={() => setMobileSidebarOpen(false)} className="p-2 -m-2 rounded-lg hover:bg-black/5" aria-label="إغلاق">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <span className="font-ui font-semibold" style={{ color: "#000000" }}>القائمة</span>
                <div className="w-10" />
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <SidebarSection label="فهرس" description="أرشيف المحادثات. كل محادثاتك منظمة هنا." cta="لا توجد محادثات بعد — ابدأ محادثة جديدة!" isEmpty={true} />
                <SidebarSection label="خليخانة" description="مشاريعك وأعمالك. مثل المشاريع في ChatGPT أو Gen في Gemini." cta="أنشئ مشروعاً لتنظيم أفكارك" isEmpty={true} />
                <SidebarSection label="أدوات" description="مجموعة أدواتك وتطبيقاتك: موسيقى، توليد صور، والمزيد." cta="أضف الأدوات التي تريدها" isEmpty={true} />
              </nav>
              <div className="shrink-0 p-4 border-t border-[#e5e5e5]">
                <button
                  onClick={() => { setSettingsOpen(true); setMobileSidebarOpen(false); }}
                  className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-black/5"
                  aria-label="الإعدادات"
                >
                  <UserAvatarIcon expanded={true} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        <div className="mb-4 md:mb-6" style={{ width: "min(40vw, 320px)" }}>
          <img
            src="/logo/logo_black.svg"
            alt="خليلي"
            className="w-full h-auto"
            style={{ filter: "none" }}
          />
        </div>

        <p
          className="font-ui font-semibold text-center mb-6 md:mb-8 text-sm md:text-base"
          style={{ color: "var(--color-accent)", lineHeight: 1.8 }}
        >
          {tagline}
        </p>

        <div className="w-full max-w-[462px] md:max-w-lg">
          <HomePillInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onVoiceMode={handleVoiceMode}
            onMicTranscript={handleTranscript}
            onFiles={(files) => {
              const names = Array.from(files).map((f) => f.name).join(", ");
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

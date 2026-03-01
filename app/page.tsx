"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, History, Settings, User, Menu, X } from "lucide-react";
import { HomePillInput } from "@/components/HomePillInput";
import { ThemeToggle } from "@/components/ThemeToggle";

const SUGGESTIONS = [
  { label: "كتابة نص", prompt: "اكتب لي نصاً عن..." },
  { label: "مساعدة دراسية", prompt: "ساعدني في فهم..." },
  { label: "ترجمة", prompt: "ترجم لي..." },
  { label: "أعمال", prompt: "ساعدني في..." },
];

export default function HomePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tagline, setTagline] = useState("حضر الأصيل .. اشطبوا الوكلاء، تعرف على خليل");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const fetchTagline = () => {
      fetch("/api/taglines/active")
        .then((r) => r.json())
        .then((d) => {
          setTagline(d.tagline ?? "حضر الأصيل .. اشطبوا الوكلاء، تعرف على خليل");
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("khalele_initial_message", trimmed);
    }
    router.push("/chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTranscript = (text: string) => {
    if (text.trim()) {
      setInput(text);
    }
  };

  const insertSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  const SidebarContent = () => (
    <>
      <div className="flex-1 px-2 py-2 min-h-0 shrink">
        <h2
          className="font-title mb-1"
          style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 700 }}
        >
          أدوات
        </h2>
        <nav className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-ui text-xs">
          {["كاتب نصوص", "مترجم", "مولد أفكار", "مساعد دراسي", "منشئ سيرة ذاتية"].map((item) => (
            <button
              key={item}
              className="w-full text-right px-2 py-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-1.5 border-t border-[var(--border-subtle)] space-y-0.5 shrink-0">
        <Link
          href="/admin"
          className="font-ui flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)] transition-colors text-xs"
          onClick={() => setSidebarOpen(false)}
        >
          <Settings size={16} />
          <span>الإعدادات</span>
        </Link>
        <button
          className="font-ui w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)] transition-colors text-xs"
        >
          <User size={16} />
          <span>الحساب</span>
        </button>
        <div className="px-2 py-1">
          <ThemeToggle />
        </div>
        <div className="mt-1 pt-1 border-t border-[var(--border-subtle)] space-y-0.5">
          <Link
            href="/chat"
            className="font-ui flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--color-gold)]/20 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/30 transition-colors text-xs"
            onClick={() => setSidebarOpen(false)}
          >
            <Plus size={16} />
            <span>محادثة جديدة</span>
          </Link>
          <Link
            href="/chat"
            className="font-ui flex items-center gap-2 px-2 py-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)] transition-colors text-xs"
            onClick={() => setSidebarOpen(false)}
          >
            <History size={16} />
            <span>سجل المحادثات</span>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden" dir="rtl">
      {/* Top bar: menu + theme toggle */}
      <div className="fixed top-4 start-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-[var(--bg-hover-strong)] text-[var(--foreground)]"
        >
          <Menu size={24} />
        </button>
        <ThemeToggle />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[var(--overlay-bg)]" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`md:hidden fixed top-0 end-0 h-full w-64 flex flex-col bg-[var(--sidebar-bg)] border-inline-start border-[var(--border-subtle)] z-50 transition-transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 end-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover-strong)]"
        >
          <X size={20} />
        </button>
        <div className="pt-12 overflow-hidden flex-1 flex flex-col min-h-0">
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-52 flex-col shrink-0 border-inline-start border-[var(--border-subtle)]">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Center hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 min-h-0">
          {/* Logo (hero title) */}
          <div
            className="mb-3"
            style={{ inlineSize: "min(52vw, 241px)", blockSize: "auto" }}
          >
            <img
              src="/logo/logo_black.svg"
              alt="خليلي"
              className="w-full h-auto logo-theme"
            />
          </div>

          {/* Tagline */}
          <p
            className="font-ui font-bold text-center text-[var(--text-muted)] mb-4 max-w-xl text-sm"
            style={{ lineHeight: 1.6, textAlign: "right" }}
          >
            {tagline}
          </p>

          {/* Input bar (pill) — matches design.svg */}
          <HomePillInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onMicTranscript={handleTranscript}
            placeholder="سلام عليكم.."
          />

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-2xl">
            {SUGGESTIONS.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => insertSuggestion(prompt)}
                className="font-ui flex items-center gap-2 px-3 py-2 rounded-[28px] bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover-strong)] hover:text-[var(--foreground)] transition-colors text-right text-sm"
                style={{ paddingInline: "20px" }}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

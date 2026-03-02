"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomePillInput } from "@/components/HomePillInput";
import { BirdToggle } from "@/components/BirdToggle";

const DEFAULT_TAGLINE = "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالعربية السهلة";

function SettingsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function HomeHero() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [incognitoMode, setIncognitoMode] = useState(false);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/taglines/active");
        if (!res.ok) return;
        const data = (await res.json()) as { tagline?: string };
        if (!canceled && data.tagline?.trim()) setTagline(data.tagline.trim());
      } catch {
        /* keep default */
      }
    };
    void load();
    return () => {
      canceled = true;
    };
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
    <div
      className="h-screen flex flex-col items-center justify-center relative overflow-hidden"
      dir="rtl"
    >
      {/* Bird toggle — top right */}
      <button
        type="button"
        onClick={() => router.push("/chat")}
        className="fixed top-5 left-5 z-50 hover:opacity-80 transition-opacity"
        aria-label="فتح المحادثات"
      >
        <BirdToggle expanded={false} size={48} />
      </button>

      {/* Settings — bottom right */}
      <button
        type="button"
        onClick={() => router.push("/chat")}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(12px)",
          color: "var(--text-muted)",
        }}
        aria-label="الإعدادات"
      >
        <SettingsIcon size={20} />
      </button>

      {/* Center content */}
      <div className="flex flex-col items-center w-full px-6 max-w-xl">
        {/* Logo */}
        <img
          src="/logo/logo_black.svg"
          alt="خليلي"
          className="logo-theme w-36 md:w-48 h-auto mb-5"
          draggable={false}
        />

        {/* Tagline */}
        <p
          className="font-ui text-sm md:text-base text-center leading-relaxed mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          {tagline}
        </p>

        {/* Smart input bar */}
        <HomePillInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onVoiceMode={() => router.push("/chat?voice=1")}
          onMicTranscript={handleMicTranscript}
          onFiles={(files) => {
            const names = Array.from(files)
              .map((f) => f.name)
              .join("، ");
            setInput((prev) => (prev ? `${prev} ${names}` : names));
          }}
          incognitoMode={incognitoMode}
          onIncognitoChange={setIncognitoMode}
          placeholder="سلام عليكم.."
        />
      </div>
    </div>
  );
}

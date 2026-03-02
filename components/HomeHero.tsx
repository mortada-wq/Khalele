"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomePillInput } from "@/components/HomePillInput";
import { BirdToggle } from "@/components/BirdToggle";

const DEFAULT_TAGLINE = "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالعربية السهلة";

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

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/taglines/active");
        if (!res.ok) return;
        const data = (await res.json()) as { tagline?: string };
        if (!canceled && data.tagline?.trim()) {
          const t = data.tagline.trim();
          const hasArabic = /[\u0600-\u06FF]/.test(t);
          if (hasArabic) setTagline(t);
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
    <div
      className="h-[100dvh] flex flex-col items-center justify-center relative"
      dir="rtl"
      style={{
        background: "#ebebec",
        overflow: "hidden",
      }}
    >
      {/* Bird toggle — top-right (in RTL = visual top-right) */}
      <button
        type="button"
        onClick={() => router.push("/chat")}
        className="fixed top-4 right-4 z-50 hover:opacity-80 transition-opacity"
        aria-label="فتح المحادثات"
      >
        <BirdToggle expanded={false} size={48} />
      </button>

      {/* User avatar — bottom-right (in RTL = visual bottom-right) */}
      <button
        type="button"
        onClick={() => router.push("/chat")}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95"
        style={{ opacity: 0.65 }}
        aria-label="الحساب والإعدادات"
      >
        <UserAvatarIcon />
      </button>

      {/* Center content */}
      <div className="flex flex-col items-center w-full px-6 max-w-xl">
        {/* Logo — black on light bg, larger */}
        <img
          src="/logo/logo_black.svg"
          alt="خليلي"
          className="w-40 md:w-56 h-auto mb-5"
          draggable={false}
          style={{ filter: "none" }}
        />

        {/* Tagline — Arabic only */}
        <p
          className="font-ui text-sm md:text-base text-center leading-relaxed mb-10"
          style={{ color: "#6b6b6b" }}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_TAGLINE = "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالعربية السهلة";

export function Hero() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    router.push(`/chat?m=${encodeURIComponent(trimmed)}`);
  };

  useEffect(() => {
    let canceled = false;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const loadTagline = async () => {
      try {
        const res = await fetch("/api/taglines/active");
        if (!res.ok) return;
        const data = (await res.json()) as {
          tagline?: string;
          rotationEnabled?: boolean;
          rotationIntervalMinutes?: number;
        };

        if (!canceled && typeof data.tagline === "string" && data.tagline.trim()) {
          setTagline(data.tagline.trim());
        }

        if (!pollId && data.rotationEnabled) {
          const intervalMins = Math.max(1, Math.min(120, Number(data.rotationIntervalMinutes) || 5));
          pollId = setInterval(() => {
            void loadTagline();
          }, intervalMins * 60 * 1000);
        }
      } catch {
        // Keep default/fallback tagline.
      }
    };

    void loadTagline();

    return () => {
      canceled = true;
      if (pollId) clearInterval(pollId);
    };
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Gold glow behind hero */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 pointer-events-none"
        style={{
          width: 800,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,142,23,0.08) 0%, transparent 70%)",
        }}
      />

      <img
        src="/logo/logo_black.svg"
        alt="خليلي"
        className="w-40 md:w-56 h-auto mb-6"
        style={{ filter: "none" }}
      />

      <h1
        className="font-title text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
        style={{ color: "#231f20" }}
      >
        ذكاء اصطناعي يتكلم عربي
        <br />
        <span style={{ color: "var(--color-accent)" }}>— بجد</span>
      </h1>

      <p
        className="font-ui text-base md:text-lg max-w-xl mb-10"
        style={{ color: "#6b6b6b", lineHeight: 1.8 }}
      >
        {tagline}
        <br />
        تكلم بطريقتك — عراقي، مصري، خليجي، شامي، مغربي — وخليلي يفهمك.
      </p>

      {/* Dialect trust chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["عراقي", "مصري", "خليجي", "شامي", "مغربي"].map((d) => (
          <span
            key={d}
            className="px-3 py-1.5 rounded-full font-ui text-xs"
            style={{
              background: "var(--color-accent-tint-08)",
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent-tint-25)",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Pill input teaser */}
      <div className="w-full max-w-md">
        <div
          className="home-pill-bar flex items-center gap-2 rounded-full px-5 py-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="سلام عليكم.."
            className="flex-1 bg-transparent font-ui text-sm outline-none text-right"
            style={{ color: "#231f20" }}
            dir="rtl"
          />
          <button
            type="button"
            onClick={handleSend}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ background: "var(--color-accent)" }}
            aria-label="إرسال"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

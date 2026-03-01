"use client";

import { SpeakButton } from "@/components/Voice/SpeakButton";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  showSpeak?: boolean;
  speechSpeed?: number;
  voiceId?: string;
}

export function ChatMessage({ role, content, showSpeak = false, speechSpeed = 1, voiceId }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-start" : "justify-end"} w-full`}
      dir="rtl"
    >
      <div
        className="max-w-[85%]"
        style={{
          background: isUser ? "var(--color-accent-tint-10)" : "#ffffff",
          border: `1px solid ${isUser ? "var(--color-accent-tint-25)" : "rgba(0,0,0,0.07)"}`,
          borderRadius: 16,
          padding: "12px 16px",
        }}
      >
        <div className="flex items-start gap-2">
          <p className="flex-1 font-ui text-base leading-relaxed whitespace-pre-wrap" style={{ color: "#231f20" }}>
            {content}
          </p>
          {!isUser && showSpeak && <SpeakButton text={content} speechSpeed={speechSpeed} voiceId={voiceId} />}
        </div>
      </div>
    </div>
  );
}

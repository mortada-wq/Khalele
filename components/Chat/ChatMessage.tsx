"use client";

import { SpeakButton } from "@/components/Voice/SpeakButton";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  showSpeak?: boolean;
}

export function ChatMessage({ role, content, showSpeak = false }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-start" : "justify-end"} w-full`}
      dir="rtl"
    >
      <div
        className={`max-w-[85%] p-4 rounded-2xl ${
          isUser
            ? "chat-message-user bg-khalele-gold/20 border border-khalele-gold/40"
            : "chat-message-ai bg-white/5 border border-white/10"
        }`}
      >
        <div className="flex items-start gap-2">
          <p className="flex-1 text-base leading-relaxed whitespace-pre-wrap">{content}</p>
          {!isUser && showSpeak && <SpeakButton text={content} />}
        </div>
      </div>
    </div>
  );
}

"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
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
        <p className="font-ui text-base leading-relaxed whitespace-pre-wrap" style={{ color: "#231f20" }}>
          {content}
        </p>
      </div>
    </div>
  );
}

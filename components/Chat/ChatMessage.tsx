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
        className={isUser ? "chat-message-user" : "chat-message-ai"}
        style={{ maxWidth: isUser ? "70%" : "85%" }}
      >
        <p
          className="font-ui text-base leading-relaxed whitespace-pre-wrap"
          style={{ color: isUser ? "white" : "var(--text-primary)" }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}

import { useRef, useEffect } from "react";
import type { Message } from "@/lib/chat";
import { ChatMessage } from "./ChatMessage";
import { FeedbackButtons } from "./FeedbackButtons";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  speechSpeed: number;
  voiceId: string;
  onSendMessage: (content: string) => void;
}

const SUGGESTION_CHIPS = [
  "اشرح لي بالعربي البسيط",
  "كيف أقول مرحبا بالإنجليزي؟",
  "اكتب لي قصيدة حب",
  "ما الفرق بين الفصحى والعامية؟",
];

export function MessageList({
  messages,
  isLoading,
  speechSpeed,
  voiceId,
  onSendMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="sidebar-scroll flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "50vh" }}>
            <p className="font-ui text-center text-sm md:text-base" style={{ color: "#8c8c8c" }}>
              ابدأ المحادثة...
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => onSendMessage(chip)}
                  className="suggestion-chip px-3 md:px-4 py-2 rounded-full font-ui text-xs md:text-sm"
                  style={{
                    background: "var(--color-accent-tint-12)",
                    color: "var(--color-accent)",
                    border: "1px solid var(--color-accent-tint-25)",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatMessage
              role={msg.role}
              content={msg.content}
              showSpeak={msg.role === "assistant"}
              speechSpeed={speechSpeed}
              voiceId={voiceId}
            />
            {msg.role === "assistant" && !msg.content.startsWith("عذراً") && (
              <FeedbackButtons messageId={msg.id} originalResponse={msg.content} />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: "12px 20px",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <span className="font-ui font-semibold" style={{ color: "var(--color-accent)", fontSize: "0.95rem" }}>
                خال خليل خلّله مع المخللات
                <span className="khalele-dots" aria-hidden>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

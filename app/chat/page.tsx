"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { FeedbackButtons } from "@/components/Chat/FeedbackButtons";
import { MicButton } from "@/components/Voice/MicButton";
import { CharacterSelector } from "@/components/Chat/CharacterSelector";
import { LanguageStyleSelector } from "@/components/Chat/LanguageStyleSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Layout/Sidebar";
import { UserPoints } from "@/components/Gamification/UserPoints";
import { DEFAULT_CHARACTERS } from "@/lib/characters";
import type { Character, LanguageStyle } from "@/lib/characters";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const id = crypto.randomUUID();
    return [{ id, title: "محادثة جديدة", messages: [], updatedAt: new Date().toISOString() }];
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTERS[0]);
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>("easy_arabic");
  const [useSearch, setUseSearch] = useState(false);
  const [empathyMode, setEmpathyMode] = useState(false);
  const [ramadanMode, setRamadanMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Auto-send initial message from home page
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialSentRef.current || typeof window === "undefined") return;
    const initial = sessionStorage.getItem("khalele_initial_message");
    if (initial?.trim()) {
      sessionStorage.removeItem("khalele_initial_message");
      initialSentRef.current = true;
      void sendMessage(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const newConversation = () => {
    const id = crypto.randomUUID();
    setConversations((prev) => [
      ...prev,
      { id, title: "محادثة جديدة", messages: [], updatedAt: new Date().toISOString() },
    ]);
    setCurrentConversationId(id);
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  const sendMessage = async (content: string) => {
    const convId = currentConversationId || crypto.randomUUID();
    if (!currentConversationId) {
      setConversations((prev) => [
        ...prev,
        { id: convId, title: content.slice(0, 30) + (content.length > 30 ? "…" : ""), messages: [], updatedAt: new Date().toISOString() },
      ]);
      setCurrentConversationId(convId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "…" : "") : c.title,
              messages: [...c.messages, userMessage],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    setIsLoading(true);

    try {
      const conv = conversations.find((c) => c.id === convId) || { messages: [] };
      const allMessages = [...conv.messages, userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          languageStyle: character.languageStyle || languageStyle,
          useSearch,
          empathyMode,
          ramadanMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `عذراً، حدث خطأ. ${error instanceof Error ? error.message : "حاول مرة ثانية."}`,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date().toISOString() }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscript = (text: string) => {
    if (text.trim()) sendMessage(text);
  };

  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
  }));

  return (
    <div className="flex h-screen overflow-hidden" dir="ltr">
      <Sidebar
        conversations={sidebarConversations}
        currentId={currentConversationId}
        onNewChat={newConversation}
        onSelectConversation={selectConversation}
        isCollapsed={sidebarCollapsed}
      />

      <main className="flex-1 flex flex-col min-w-0" dir="rtl">
        <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl" dir="ltr">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)] transition-colors"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <Link href="/" className="text-khalele-gold font-bold text-lg">
            خليلي
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserPoints />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={useSearch} onChange={(e) => setUseSearch(e.target.checked)} className="rounded accent-khalele-gold" />
              <span className="text-[var(--text-muted)]">بحث</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={empathyMode} onChange={(e) => setEmpathyMode(e.target.checked)} className="rounded accent-khalele-gold" />
              <span className="text-[var(--text-muted)]">تعاطف</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={ramadanMode} onChange={(e) => setRamadanMode(e.target.checked)} className="rounded accent-khalele-gold" />
              <span className="text-[var(--text-muted)]">رمضان</span>
            </label>
            <LanguageStyleSelector value={languageStyle} onChange={setLanguageStyle} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <CharacterSelector selected={character} onSelect={setCharacter} />

            <div ref={scrollRef} className="mt-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-24 text-[var(--text-muted)]">
                  <p className="text-2xl mb-3 font-medium">مرحباً</p>
                  <p className="text-base">اكتب أي شيء — خليلي يفهم كل اللهجات العربية ويرد بالفصحى أو العربية السهلة</p>
                  <p className="text-sm mt-2 text-[var(--text-subtle)]">أو استخدم الميكروفون للتحدث</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === "user" ? "flex justify-start" : "flex justify-end"}>
                  <div className="max-w-[85%]">
                    <ChatMessage role={msg.role} content={msg.content} showSpeak={msg.role === "assistant"} />
                    {msg.role === "assistant" && !msg.content.startsWith("عذراً") && (
                      <FeedbackButtons messageId={msg.id} originalResponse={msg.content} />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-message-ai p-4">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-khalele-gold/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-khalele-gold/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-khalele-gold/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl">
          <div className="max-w-3xl mx-auto flex gap-2 items-end">
            <MicButton onTranscript={handleTranscript} disabled={isLoading} />
            <div className="flex-1 min-w-0">
              <ChatInput onSend={sendMessage} disabled={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

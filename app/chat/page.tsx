"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { HomePillInput } from "@/components/HomePillInput";
import { MessageList } from "@/components/Chat/MessageList";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

import { SettingsModal } from "@/components/Settings";
import { CallModeOverlay } from "@/components/Voice/CallModeOverlay";
import { DEFAULT_CHARACTERS } from "@/lib/characters";
import type { Character, LanguageStyle } from "@/lib/characters";
import { detectIntegrationIntent, type IntegrationSuggestion } from "@/lib/connectors";
import { ToolsModal } from "@/components/Tools";
import { ADMIN_TOOLS, getUserTools } from "@/lib/tools";
import { getOrCreateUserId } from "@/lib/chat";
import type { Message, Conversation } from "@/lib/chat";
import type { FactCheckMode } from "@/lib/factcheck-config";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/constants";

const MAX_REASON_LENGTH = 180;
const DEFAULT_TAGLINE = "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالعربية السهلة";

interface ProfileNicknameSuggestion {
  value: string;
  generatedAt: string;
  status: "pending" | "accepted" | "rejected";
}

interface ChatUserProfile {
  userId: string;
  preferences: {
    nickname?: string;
    languageStyle?: LanguageStyle;
    dialectRegion?: "baghdad" | "basra" | "mosul";
  };
  factCheckMode?: FactCheckMode;
  nicknameSuggestion?: ProfileNicknameSuggestion;
  createdAt: string;
  updatedAt: string;
}

interface NicknameStatus {
  delayHours: number;
  ready: boolean;
  hoursRemaining: number;
}

interface ProfileApiResponse {
  profile: ChatUserProfile;
  nicknameStatus: NicknameStatus;
}

function buildBehaviorSnapshot(conversations: Conversation[]) {
  let totalMessages = 0;
  let chars = 0;
  let questions = 0;
  let lateNightMessages = 0;

  for (const conv of conversations) {
    const hour = new Date(conv.updatedAt).getHours();
    const isLateNight = hour >= 23 || hour < 6;
    for (const msg of conv.messages) {
      if (msg.role !== "user") continue;
      const content = msg.content.trim();
      if (!content) continue;
      totalMessages += 1;
      chars += content.length;
      if (content.includes("?") || content.includes("؟")) questions += 1;
      if (isLateNight) lateNightMessages += 1;
    }
  }

  return {
    totalMessages,
    avgCharsPerMessage: totalMessages > 0 ? Math.round(chars / totalMessages) : 0,
    questionRatio: totalMessages > 0 ? questions / totalMessages : 0,
    lateNightRatio: totalMessages > 0 ? lateNightMessages / totalMessages : 0,
  };
}

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const id = crypto.randomUUID();
    return [{
      id,
      title: "محادثة جديدة",
      messages: [],
      characterId: DEFAULT_CHARACTERS[0].id,
      updatedAt: new Date().toISOString(),
    }];
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character>(DEFAULT_CHARACTERS[0]);
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>("easy_arabic");
  const [speechSpeed, setSpeechSpeed] = useState(() => {
    if (typeof window === "undefined") return 1;
    const v = localStorage.getItem("khalele_speech_speed");
    const n = v ? parseFloat(v) : 1;
    return Number.isFinite(n) && n >= 0.5 && n <= 2 ? n : 1;
  });
  const [voiceId, setVoiceId] = useState(() => {
    if (typeof window === "undefined") return "ar-XA-Wavenet-A";
    return localStorage.getItem("khalele_voice_id") || "ar-XA-Wavenet-A";
  });
  const [systemPrompt, setSystemPrompt] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_SYSTEM_PROMPT;
    return localStorage.getItem("khalele_system_prompt") || DEFAULT_SYSTEM_PROMPT;
  });
  const [useSearch] = useState(false);
  const [empathyMode] = useState(false);
  const [ramadanMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string | undefined>();
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [, setSuggestionBanner] = useState<IntegrationSuggestion>(null);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [userToolIds, setUserToolIds] = useState<string[]>([]);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [notebooks, setNotebooks] = useState<{ id: string; name: string; preview?: string; createdAt?: string }[]>([]);
  const [profileData, setProfileData] = useState<ChatUserProfile | null>(null);
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus | null>(null);
  const [nicknameTone, setNicknameTone] = useState("");
  const [nicknameActionMessage, setNicknameActionMessage] = useState<string | null>(null);
  const [nicknameActionBusy, setNicknameActionBusy] = useState(false);
  const [showRejectReasonInput, setShowRejectReasonInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showDeleteReasonInput, setShowDeleteReasonInput] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [factCheckMode] = useState<FactCheckMode>("off");
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const userIdRef = useRef<string>("");
  const incognitoIdRef = useRef<string>("");
  const dismissedBannersRef = useRef<Set<IntegrationSuggestion>>(new Set());
  const nicknameSuggestRequestedRef = useRef(false);

  const apiHeaders = () => ({
    "Content-Type": "application/json",
    "x-user-id": incognitoMode
      ? (incognitoIdRef.current || (incognitoIdRef.current = `incognito_${crypto.randomUUID()}`))
      : userIdRef.current || getOrCreateUserId(),
  });

  const handleAvatarClick = () => {
    if (!session) {
      signIn();
    } else {
      setSettingsOpen(true);
    }
  };

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages ?? [];
  const showHero = messages.length === 0 && !isLoading;
  const activeNickname = profileData?.preferences?.nickname?.trim() ?? "";
  const pendingNickname =
    profileData?.nicknameSuggestion?.status === "pending" ? profileData.nicknameSuggestion.value : "";
  const userDisplayName = session?.user?.name?.trim() || "ضيف خليل";

  const loadProfile = async () => {
    if (incognitoMode) return;
    try {
      const res = await fetch("/api/profile", { headers: apiHeaders() });
      if (!res.ok) return;
      const data = (await res.json()) as ProfileApiResponse;
      setProfileData(data.profile);
      setNicknameStatus(data.nicknameStatus);
      setNicknameActionMessage(null);
      void (profileData?.factCheckMode); // fact-check mode disabled in UI
    } catch {
      // Ignore profile load errors and continue chat normally.
    }
  };

  const requestNicknameSuggestion = async () => {
    if (incognitoMode || profileData?.preferences.nickname) return;
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          action: "suggest",
          behaviorSnapshot: buildBehaviorSnapshot(conversations),
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        profile: ChatUserProfile;
        suggestion: ProfileNicknameSuggestion | null;
        tone?: string;
        status?: { ready?: boolean; hoursRemaining?: number };
      };
      setProfileData(data.profile);
      if (data.tone) setNicknameTone(data.tone);
      const hoursRemaining = data.status?.hoursRemaining;
      if (typeof hoursRemaining === "number") {
        setNicknameStatus((prev) => ({
          delayHours: prev?.delayHours ?? 3,
          ready: data.status?.ready ?? false,
          hoursRemaining,
        }));
      }
    } catch {
      // Keep experience uninterrupted.
    }
  };

  const acceptSuggestedNickname = async () => {
    if (!pendingNickname || incognitoMode || nicknameActionBusy) return;
    setNicknameActionBusy(true);
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ action: "accept", nickname: pendingNickname }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { profile: ChatUserProfile };
      setProfileData(data.profile);
      setShowRejectReasonInput(false);
      setRejectReason("");
      setNicknameActionMessage("تم اعتماد اللقب بنجاح.");
    } catch {
      setNicknameActionMessage("تعذر حفظ اللقب حالياً.");
    } finally {
      setNicknameActionBusy(false);
    }
  };

  const rejectSuggestedNickname = async () => {
    if (!pendingNickname || incognitoMode || nicknameActionBusy) return;
    const reason = rejectReason.trim().slice(0, MAX_REASON_LENGTH);
    if (!reason) {
      setNicknameActionMessage("اكتب سببًا قصيرًا لرفض اللقب.");
      return;
    }
    setNicknameActionBusy(true);
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ action: "reject", nickname: pendingNickname, reason }),
      });
      const data = (await res.json()) as { profile: ChatUserProfile; message?: string };
      if (!res.ok) {
        setNicknameActionMessage("تعذر إرسال السبب.");
        return;
      }
      setProfileData(data.profile);
      setShowRejectReasonInput(false);
      setRejectReason("");
      setNicknameActionMessage(data.message || "تم إرسال السبب لخليل.");
      nicknameSuggestRequestedRef.current = false;
    } catch {
      setNicknameActionMessage("تعذر إرسال السبب.");
    } finally {
      setNicknameActionBusy(false);
    }
  };

  const deleteActiveNickname = async () => {
    if (!activeNickname || incognitoMode || nicknameActionBusy) return;
    const reason = deleteReason.trim().slice(0, MAX_REASON_LENGTH);
    if (!reason) {
      setNicknameActionMessage("اكتب سببًا قصيرًا قبل حذف اللقب.");
      return;
    }
    setNicknameActionBusy(true);
    try {
      const res = await fetch("/api/profile/nickname", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ action: "delete", reason }),
      });
      const data = (await res.json()) as { profile: ChatUserProfile; message?: string };
      if (!res.ok) {
        setNicknameActionMessage("تعذر حذف اللقب.");
        return;
      }
      setProfileData(data.profile);
      setShowDeleteReasonInput(false);
      setDeleteReason("");
      setNicknameActionMessage(data.message || "تم حذف اللقب.");
      nicknameSuggestRequestedRef.current = false;
    } catch {
      setNicknameActionMessage("تعذر حذف اللقب.");
    } finally {
      setNicknameActionBusy(false);
    }
  };

  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (!currentConversationId) return;
    const conv = conversations.find((c) => c.id === currentConversationId);
    if (!conv) return;

    const nextCharacter = DEFAULT_CHARACTERS.find((c) => c.id === conv.characterId) ?? DEFAULT_CHARACTERS[0];
    setCharacter((prev) => (prev.id === nextCharacter.id ? prev : nextCharacter));
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (typeof window !== "undefined") setUserToolIds(getUserTools());
  }, []);

  useEffect(() => {
    if (toolsModalOpen) setUserToolIds(getUserTools());
  }, [toolsModalOpen]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/api/taglines/active");
        if (!res.ok) return;
        const data = (await res.json()) as { tagline?: string };
        if (!canceled && data.tagline?.trim()) {
          const t = data.tagline.trim();
          if (/[\u0600-\u06FF]/.test(t)) setTagline(t);
        }
      } catch { /* keep default */ }
    })();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await fetch("/api/notebooks?limit=50", {
          headers: apiHeaders(),
        });
        if (!res.ok || canceled) return;
        const data = (await res.json()) as { notebooks?: { id: string; title: string; content: string; updatedAt: string }[] };
        const list = data.notebooks ?? [];
        if (!canceled) {
          setNotebooks(
            list.map((n) => ({
              id: n.id,
              name: n.title,
              preview: n.content.split("\n")[0]?.trim().slice(0, 40) || undefined,
              createdAt: n.updatedAt,
            }))
          );
        }
      } catch { /* ignore */ }
    })();
    return () => { canceled = true; };
  }, [incognitoMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = sessionStorage.getItem("khalele_incognito");
    if (v === "1") {
      sessionStorage.removeItem("khalele_incognito");
      setIncognitoMode(true);
    }
  }, []);

  // Open Call Mode when coming from home page (wave icon)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("khalele_open_call_mode") === "1") {
      sessionStorage.removeItem("khalele_open_call_mode");
      setVoiceOverlayOpen(true);
    }
  }, []);

  // When incognito turns on, use fresh ephemeral ID; when off, restore persisted ID
  useEffect(() => {
    if (incognitoMode) {
      incognitoIdRef.current = `incognito_${crypto.randomUUID()}`;
    } else {
      userIdRef.current = getOrCreateUserId();
    }
  }, [incognitoMode]);

  // Fetch conversations from API on mount (skip when incognito — chat without user identity)
  useEffect(() => {
    userIdRef.current = getOrCreateUserId();
    if (incognitoMode) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversations", { headers: apiHeaders() });
        if (cancelled) return;
        if (res.ok) {
          const { conversations: list } = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const mapped: Conversation[] = list.map(
              (c: {
                conversationId: string;
                title: string;
                messages: { id: string; role: string; content: string }[];
                characterId?: string;
                updatedAt: string;
              }) => ({
                id: c.conversationId,
                title: c.title,
                messages: (c.messages || []).map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
                characterId: typeof c.characterId === "string" ? c.characterId : DEFAULT_CHARACTERS[0].id,
                updatedAt: c.updatedAt,
              })
            );
            setConversations(mapped);
            setCurrentConversationId(mapped[0].id);
            const initialCharacter = DEFAULT_CHARACTERS.find((ch) => ch.id === mapped[0].characterId) ?? DEFAULT_CHARACTERS[0];
            setCharacter(initialCharacter);
          }
        }
      } catch {
        // Keep default in-memory conversation
      } finally {
        if (!cancelled) setConversationsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [incognitoMode]);

  useEffect(() => {
    if (incognitoMode) {
      setProfileData(null);
      setNicknameStatus(null);
      setNicknameActionMessage(null);
      setShowDeleteReasonInput(false);
      setShowRejectReasonInput(false);
      return;
    }
    if (!conversationsLoaded) return;
    nicknameSuggestRequestedRef.current = false;
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incognitoMode, conversationsLoaded]);

  useEffect(() => {
    if (incognitoMode || !profileData) return;
    if (profileData.preferences.nickname) return;
    if (profileData.nicknameSuggestion?.status === "pending") return;
    if (nicknameStatus && !nicknameStatus.ready) return;
    if (nicknameSuggestRequestedRef.current) return;
    nicknameSuggestRequestedRef.current = true;
    void requestNicknameSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incognitoMode, profileData, nicknameStatus, conversations]);

  // Auto-send initial message from home page (URL ?m= or sessionStorage)
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialSentRef.current || !conversationsLoaded) return;
    const fromUrl = searchParams.get("m");
    const fromStorage = typeof window !== "undefined" ? sessionStorage.getItem("khalele_initial_message") : null;
    const fromNotebook = typeof window !== "undefined" ? sessionStorage.getItem("khalele_import_from_notebook") : null;
    if (fromNotebook) sessionStorage.removeItem("khalele_import_from_notebook");
    const initial = (fromUrl ? decodeURIComponent(fromUrl) : fromStorage ?? fromNotebook)?.trim();
    if (initial) {
      if (fromStorage) sessionStorage.removeItem("khalele_initial_message");
      if (fromUrl) router.replace("/chat");
      initialSentRef.current = true;
      // Add user message to current conversation immediately so it shows, then send
      const convId = conversations[0].id;
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: initial };
      setCurrentConversationId(convId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                title: initial.slice(0, 30) + (initial.length > 30 ? "…" : ""),
                messages: [...c.messages, userMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
      void sendMessageInternal(initial, convId, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversationsLoaded]);

  const persistConversation = async (conv: Conversation) => {
    if (incognitoMode) return;
    try {
      await fetch(`/api/conversations/${conv.id}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({
          title: conv.title,
          messages: conv.messages,
          characterId: conv.characterId,
          factCheckMode: conv.factCheckMode || factCheckMode,
        }),
      });
    } catch {
      // Fallback: keep in-memory only
    }
  };

  const sendMessageInternal = async (
    content: string,
    convId: string,
    existingMessages: Message[] = []
  ): Promise<string | null> => {
    setIsLoading(true);
    const allMessages = [...existingMessages, { role: "user" as const, content }];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          languageStyle: character.languageStyle || languageStyle,
          characterId: character.id,
          useSearch,
          empathyMode,
          ramadanMode,
          customSystemPrompt: systemPrompt !== DEFAULT_SYSTEM_PROMPT ? systemPrompt : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const aiContent = data.content as string;
      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: aiContent };
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date().toISOString() } : c
        );
        const conv = updated.find((c) => c.id === convId);
        if (conv) void persistConversation(conv);
        return updated;
      });
      return aiContent;
    } catch (error) {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `عذراً، حدث خطأ. ${error instanceof Error ? error.message : "حاول مرة ثانية."}`,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, errMsg], updatedAt: new Date().toISOString() } : c
        )
      );
      return errMsg.content;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string): Promise<string | null> => {
    const convId = currentConversationId || crypto.randomUUID();
    if (!currentConversationId) {
      setConversations((prev) => [
        ...prev,
        {
          id: convId,
          title: content.slice(0, 30) + (content.length > 30 ? "…" : ""),
          messages: [],
          characterId: character.id,
          factCheckMode,
          updatedAt: new Date().toISOString(),
        },
      ]);
      setCurrentConversationId(convId);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "…" : "") : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      const conv = updated.find((c) => c.id === convId);
      if (conv) void persistConversation(conv);
      return updated;
    });
      const conv = conversations.find((c) => c.id === convId) || { messages: [], factCheckMode };
      return sendMessageInternal(content, convId, conv.messages);
    };

  const regenerateMessage = (assistantMessageId: string) => {
    if (!currentConversationId || isLoading) return;
    const conv = conversations.find((c) => c.id === currentConversationId);
    if (!conv) return;

    const msgIndex = conv.messages.findIndex((m) => m.id === assistantMessageId);
    if (msgIndex < 0) return;

    // Find the user message that preceded this assistant response
    let userContent = "";
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (conv.messages[i].role === "user") {
        userContent = conv.messages[i].content;
        break;
      }
    }
    if (!userContent) return;

    // Remove the old assistant message and regenerate
    const messagesBeforeAssistant = conv.messages.slice(0, msgIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? { ...c, messages: messagesBeforeAssistant, updatedAt: new Date().toISOString() }
          : c
      )
    );

    // Re-send with conversation history up to (but not including) the user message that triggered it
    const historyBefore = messagesBeforeAssistant.slice(0, -1);
    void sendMessageInternal(userContent, currentConversationId, historyBefore);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    void sendMessage(trimmed);

    // Contextual integration prompt: suggest connecting when user tries related feature
    const intent = detectIntegrationIntent(trimmed);
    if (intent && !dismissedBannersRef.current.has(intent)) {
      dismissedBannersRef.current.add(intent);
      setSuggestionBanner(intent);
    }
  };

  const startNewChat = async () => {
    const id = crypto.randomUUID();
    const newConv: Conversation = {
      id,
      title: "محادثة جديدة",
      messages: [],
      characterId: character.id,
      factCheckMode,
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(id);
    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: apiHeaders(),
          body: JSON.stringify({
            conversationId: id,
            title: newConv.title,
            messages: [],
            characterId: newConv.characterId,
            factCheckMode,
          }),
        });
    } catch {
      // Fallback: in-memory only
    }
  };

  const handleShare = () => {
    if (typeof navigator?.share !== "undefined" && currentConversation) {
      const text = currentConversation.messages
        .map((m) => `${m.role === "user" ? "أنت" : "خليل"}: ${m.content}`)
        .join("\n\n");
      void navigator.share({
        title: currentConversation.title || "محادثة خليل",
        text,
      });
    } else {
      const text = currentConversation?.messages
        .map((m) => `${m.role === "user" ? "أنت" : "خليل"}: ${m.content}`)
        .join("\n\n") ?? "";
      void navigator.clipboard?.writeText(text);
    }
  };

  const handleReport = () => {
    if (!currentConversation?.messages?.length) return;
    const reportTitle = `تقرير: ${currentConversation.title || "محادثة"}`;
    const reportContent = currentConversation.messages
      .map((m) => `${m.role === "user" ? "المستخدم" : "خليل"}: ${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle.slice(0, 40)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnhance = (content: string) => {
    void sendMessage(`زد في التوضيح:\n\n${content}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl" style={{ background: "var(--bg-tertiary)" }}>
      <TopBar
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((p) => !p)}
        onAvatarClick={handleAvatarClick}
        onNewChat={startNewChat}
        onShare={handleShare}
        onReport={handleReport}
        userRole={userRole}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          expanded={sidebarExpanded}
          onClose={() => setSidebarExpanded(false)}
          conversations={conversations}
          currentConversationId={currentConversationId}
          reports={[]}
          projects={notebooks}
          studies={[]}
          stealthMode={incognitoMode}
          onStealthChange={setIncognitoMode}
          onSelectConversation={setCurrentConversationId}
          onSelectProject={(nid) => router.push(`/notebooks/${nid}`)}
          onCreateProject={async () => {
            try {
              const res = await fetch("/api/notebooks", {
                method: "POST",
                headers: apiHeaders(),
                body: JSON.stringify({ title: "دفتر جديد" }),
              });
              const data = (await res.json()) as { notebook?: { id: string } };
              if (data?.notebook?.id) router.push(`/notebooks/${data.notebook.id}`);
            } catch { /* ignore */ }
          }}
        />

      <main className="flex-1 flex flex-col min-w-0 relative min-h-0 overflow-hidden">
        <motion.div
          className="flex-1 flex flex-col min-w-0"
          animate={{ opacity: voiceOverlayOpen ? 0.3 : 1 }}
          transition={{ duration: 0.2 }}
        >
        {showHero ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <img
              src="/logo/logo_black.svg"
              alt="خليلي"
              className="logo-theme w-40 md:w-56 h-auto mb-5"
              draggable={false}
            />
            <p
              className="font-ui text-sm md:text-base text-center leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {tagline}
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            speechSpeed={speechSpeed}
            voiceId={voiceId}
            onSendMessage={sendMessage}
            onRegenerate={regenerateMessage}
            onEnhance={handleEnhance}
          />
        )}

        <div className="shrink-0 px-4 md:px-6 pb-4 md:pb-6 pt-1">
          <div className="max-w-2xl mx-auto">
            <HomePillInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onVoiceMode={() => setVoiceOverlayOpen(true)}
              onMicTranscript={(text) => {
                if (text.trim()) { setInput(""); void sendMessage(text); }
              }}
              onFiles={(files) => {
                const names = Array.from(files).map((f) => f.name).join(", ");
                setInput((prev) => (prev ? `${prev} ${names}` : names));
              }}
              incognitoMode={incognitoMode}
              onIncognitoChange={setIncognitoMode}
              placeholder={showHero ? "سلام عليكم.." : "اكتب رسالتك..."}
              disabled={isLoading}
            />
          </div>
        </div>
        </motion.div>
      </main>
      </div>

      <ToolsModal
        open={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
        onToolsChange={() => setUserToolIds(getUserTools())}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setSettingsInitialSection(undefined);
        }}
        initialSettings={{ languageStyle, speechSpeed, voiceId, systemPrompt, nickname: activeNickname }}
        initialSection={settingsInitialSection === "apps" ? "apps" : undefined}
        onSave={(s) => {
          setLanguageStyle(s.languageStyle);
          setSpeechSpeed(s.speechSpeed);
          setVoiceId(s.voiceId);
          setSystemPrompt(s.systemPrompt);
          if (typeof window !== "undefined") {
            localStorage.setItem("khalele_speech_speed", String(s.speechSpeed));
            localStorage.setItem("khalele_voice_id", s.voiceId);
            localStorage.setItem("khalele_system_prompt", s.systemPrompt);
          }
          if (!incognitoMode) {
            const nextNickname = s.nickname.trim();
            if (nextNickname !== activeNickname) {
              setProfileData((prev) =>
                prev
                  ? {
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        ...(nextNickname ? { nickname: nextNickname } : { nickname: undefined }),
                      },
                      updatedAt: new Date().toISOString(),
                    }
                  : prev
              );
              void (async () => {
                try {
                  const res = await fetch("/api/profile", {
                    method: "PUT",
                    headers: apiHeaders(),
                    body: JSON.stringify({ nickname: nextNickname }),
                  });
                  if (!res.ok) return;
                  const data = (await res.json()) as ProfileApiResponse;
                  setProfileData(data.profile);
                  setNicknameStatus(data.nicknameStatus);
                } catch {
                  // Ignore sync errors; local state already updated.
                }
              })();
            }
          }
        }}
      />

      <CallModeOverlay
        open={voiceOverlayOpen}
        onClose={() => setVoiceOverlayOpen(false)}
        onSendAndGetResponse={sendMessage}
        speechSpeed={speechSpeed}
        voiceId={voiceId}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}><span style={{ color: "var(--text-tertiary)" }}>جاري التحميل...</span></div>}>
      <ChatPageContent />
    </Suspense>
  );
}

"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { HomePillInput } from "@/components/HomePillInput";
import { MessageList } from "@/components/Chat/MessageList";
import { ConversationList } from "@/components/Chat/ConversationList";

import { BirdToggle } from "@/components/BirdToggle";
import { SettingsModal } from "@/components/Settings";
import { CallModeOverlay } from "@/components/Voice/CallModeOverlay";
import { DEFAULT_CHARACTERS } from "@/lib/characters";
import type { Character, LanguageStyle } from "@/lib/characters";
import { detectIntegrationIntent, type IntegrationSuggestion } from "@/lib/connectors";
import { ToolsModal } from "@/components/Tools";
import { ADMIN_TOOLS, getUserTools } from "@/lib/tools";
import { groupConversationsByDate, getOrCreateUserId } from "@/lib/chat";
import type { Message, Conversation } from "@/lib/chat";
import type { FactCheckMode } from "@/lib/factcheck-config";

function UserAvatarIcon({ expanded, role }: { expanded: boolean; role?: "admin" | "user" }) {
  const isAdmin = role === "admin";
  const fillColor = isAdmin
    ? "#D4A017"
    : expanded
      ? "var(--color-accent-avatar-expanded)"
      : "var(--color-accent-avatar-collapsed)";
  const strokeEnd = isAdmin ? "#FFD700" : expanded ? "#fff" : "#ebebec";
  const gradientId = isAdmin ? "c-avatar-stroke-admin" : expanded ? "c-avatar-stroke-in" : "c-avatar-stroke-out";
  return (
    <svg
      viewBox="0 0 33.5 39.75"
      width="35"
      height="42"
      aria-hidden
      className={isAdmin ? "admin-avatar-glow" : ""}
      style={{ opacity: isAdmin ? 1 : 0.65, textAlign: "center" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="19.87" x2="33.5" y2="19.87" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={isAdmin ? "#B8860B" : "#5e5e5e"} stopOpacity={isAdmin ? 1 : 0} />
          <stop offset="1" stopColor={strokeEnd} />
        </linearGradient>
      </defs>
      <circle fill={fillColor} cx="16.75" cy="17.55" r="5.83" />
      <path
        stroke={`url(#${gradientId})`}
        strokeMiterlimit="10"
        strokeWidth=".28"
        fill={isAdmin ? "#D4A017" : "none"}
        d="M28.59,9.99c-2.88-3.56-6.76-6.48-10.76-9.49-.64-.48-1.52-.48-2.16,0C7.69,6.52.15,12.2.15,23.26c-.14,4.32,1.46,8.52,4.46,11.64.23.23.45.45.7.66,2.81,2.37,6.31,3.77,9.98,3.97.98.02,1.95.04,2.93.06h0c3.67-.22,7.17-1.61,9.98-3.99,3.38-2.97,5.16-7.24,5.16-12.33,0-5.55-1.88-9.74-4.77-13.3ZM27.41,31.2c-.29.38-.61.74-.95,1.07-1.78-5.35-7.56-8.25-12.91-6.47-2.87.95-5.17,3.13-6.28,5.95-.52-.48-.99-1.01-1.39-1.58-1.89-3.07-2.55-6.74-1.84-10.28,1.18-6.28,5.76-10.43,12.72-15.7,8.13,6.18,13.02,10.81,13.02,19.04.11,2.85-.72,5.65-2.36,7.97Z"
      />
    </svg>
  );
}

/* ── Section navigation icons — consistent outline style ── */
function SectionIcon({ section, color }: { section: string; color: string }) {
  const s = 20;
  const st = { color, flexShrink: 0 } as const;

  if (section === "بحث") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  if (section === "أدوات") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );

  if (section === "خليخانة") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  if (section === "دفاتر") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={st}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );

  return null;
}

const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
  const [useSearch] = useState(false);
  const [empathyMode] = useState(false);
  const [ramadanMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("بحث");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string | undefined>();
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [, setSuggestionBanner] = useState<IntegrationSuggestion>(null);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [userToolIds, setUserToolIds] = useState<string[]>([]);
  const [incognitoMode, setIncognitoMode] = useState(false);
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

  const SECTIONS = ["بحث", "أدوات", "خليخانة", "دفاتر"] as const;

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
    const initial = (fromUrl ? decodeURIComponent(fromUrl) : fromStorage)?.trim();
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

  const grouped = groupConversationsByDate(conversations);

  return (
    <div className="h-screen flex overflow-hidden" dir="rtl" style={{ background: "var(--bg-tertiary)" }}>
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: sidebarExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: sidebarExpanded ? "var(--bg-secondary)" : "var(--bg-tertiary)",
          borderTopLeftRadius: sidebarExpanded ? 20 : 0,
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}
      >
        <div className="shrink-0" style={{ height: 72 }}>
          <button
            onClick={() => setSidebarExpanded((p) => !p)}
            className="absolute flex items-center justify-center"
            style={{ top: 0, right: 0, width: SIDEBAR_W_COLLAPSED, height: 72 }}
            aria-label={sidebarExpanded ? "طي القائمة" : "فتح القائمة"}
          >
            <BirdToggle expanded={sidebarExpanded} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {sidebarExpanded ? (
            <div className="sidebar-scroll flex-1 min-h-0 px-3 py-2 overflow-y-auto">
              <button
                type="button"
                onClick={startNewChat}
                className="w-full flex items-center gap-2.5 px-4 py-3 mb-3 font-ui transition-colors"
                style={{
                  background: "transparent",
                  border: "var(--border-subtle)",
                  color: "var(--text-primary)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>محادثة جديدة</span>
              </button>

              <div className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section}
                    onClick={() => setCurrentSection(section)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-ui transition-colors"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: currentSection === section ? 700 : 600,
                      background: currentSection === section ? "var(--color-accent-tint-12)" : "transparent",
                      color: currentSection === section ? "var(--color-accent)" : "var(--text-primary)",
                      border: currentSection === section ? "1px solid var(--color-accent-tint-25)" : "1px solid transparent",
                    }}
                  >
                    <SectionIcon section={section} color={currentSection === section ? "var(--color-accent)" : "var(--text-secondary)"} />
                    <span>{section}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => router.push("/tahseen-khaleel")}
                className="w-full flex items-center gap-2.5 px-4 py-3 mt-2 rounded-xl font-ui transition-colors hover:bg-black/5"
                style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>تحسين خليل</span>
              </button>

              {!incognitoMode && !activeNickname && (
                <div
                  className="mt-3 p-3 rounded-xl font-ui"
                  style={{ background: "var(--color-accent-tint-08)", border: "1px solid var(--color-accent-tint-25)" }}
                >
                  {pendingNickname ? (
                    <div className="space-y-2">
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>خليل راقب السلوك شوي واختار لك لقب:</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                        {pendingNickname}
                      </p>
                      {nicknameTone && (
                        <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{nicknameTone}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={nicknameActionBusy}
                          onClick={acceptSuggestedNickname}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-60"
                          style={{ background: "var(--color-accent)" }}
                        >
                          أعتمده
                        </button>
                        <button
                          type="button"
                          disabled={nicknameActionBusy}
                          onClick={() => setShowRejectReasonInput((prev) => !prev)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
                          style={{ background: "#f3f3f3", color: "#555" }}
                        >
                          لا يعجبني
                        </button>
                      </div>
                      {showRejectReasonInput && (
                        <div className="space-y-1">
                          <input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            maxLength={MAX_REASON_LENGTH}
                            placeholder="سبب الرفض لخليل..."
                            className="w-full px-2.5 py-2 rounded-lg text-xs"
                            style={{ border: "1px solid #ddd", background: "#fff" }}
                          />
                          <button
                            type="button"
                            disabled={nicknameActionBusy}
                            onClick={rejectSuggestedNickname}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
                            style={{ background: "#ffeaea", color: "#b02a2a" }}
                          >
                            إرسال سبب الرفض
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: "#666", lineHeight: 1.7 }}>
                      {nicknameStatus && !nicknameStatus.ready
                        ? `خليل يجهز لقبك خلال ${nicknameStatus.hoursRemaining.toFixed(1)} ساعة تقريباً.`
                        : "خليل يراقب المزاج العام ليقترح لقباً مناسباً."}
                    </p>
                  )}
                </div>
              )}

              {currentSection === "بحث" && (
                <div className="mt-4 px-1">
                  <input
                    type="text"
                    placeholder="ابحث في المحادثات..."
                    className="w-full px-3 py-2.5 rounded-xl font-ui text-sm"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "var(--border-subtle)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {currentSection === "أدوات" && (
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => setToolsModalOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>أضف أدوات</span>
                  </button>
                  {userToolIds.length > 0 ? (
                    <div className="space-y-1">
                      {userToolIds.map((id) => {
                        const tool = ADMIN_TOOLS.find((t) => t.id === id);
                        if (!tool) return null;
                        return (
                          <button
                            key={tool.id}
                            className="w-full text-right px-4 py-2.5 rounded-lg font-ui text-sm truncate transition-colors hover:bg-black/5 block"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {tool.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-4 py-2 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
                      لم تضف أدوات بعد — اضغط أضف أدوات لاختيارها
                    </p>
                  )}
                </div>
              )}

              {currentSection === "خليخانة" && (
                <p className="mt-4 px-4 py-2 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
                  أنشئ مشروعاً لتنظيم أفكارك
                </p>
              )}

              {currentSection === "دفاتر" && (
                <p className="mt-4 px-4 py-2 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
                  لا توجد دفاتر بعد — أنشئ دفتراً جديداً لتبدأ
                </p>
              )}

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <p className="px-4 pb-2 font-ui text-xs" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>المحادثات السابقة</p>
                <ConversationList
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={setCurrentConversationId}
                  onNewChat={startNewChat}
                  groupedConversations={grouped}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {sidebarExpanded ? (
          <div
            className="shrink-0 pb-4 pt-2 px-3"
            style={{ borderTop: "var(--border-subtle)" }}
          >
            <button
              onClick={handleAvatarClick}
              className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-black/5 transition-colors"
              aria-label="الحساب والإعدادات"
            >
              <UserAvatarIcon expanded={true} role={userRole} />
              <div className="min-w-0 text-right">
                <p className="font-ui text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {activeNickname || userDisplayName}
                </p>
                <p className="font-ui text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                  {activeNickname ? userDisplayName : "اضغط لفتح الإعدادات"}
                </p>
              </div>
            </button>

            {activeNickname && (
              <div className="mt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteReasonInput((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#ffeaea", color: "#b02a2a" }}
                >
                  حذف اللقب
                </button>
                {showDeleteReasonInput && (
                  <div className="space-y-1">
                    <input
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      maxLength={MAX_REASON_LENGTH}
                      placeholder="ليش ما عجبك اللقب؟"
                      className="w-full px-2.5 py-2 rounded-lg text-xs"
                      style={{ border: "1px solid #ddd", background: "#fff" }}
                    />
                    <button
                      type="button"
                      disabled={nicknameActionBusy}
                      onClick={deleteActiveNickname}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
                      style={{ background: "#f3f3f3", color: "#555" }}
                    >
                      تأكيد الحذف
                    </button>
                  </div>
                )}
              </div>
            )}

            {nicknameActionMessage && (
              <p className="font-ui text-[11px] mt-2" style={{ color: "var(--text-secondary)" }}>
                {nicknameActionMessage}
              </p>
            )}
          </div>
        ) : (
          <div
            className="shrink-0 flex flex-col items-center gap-2 pb-4 pt-2"
            style={{ width: SIDEBAR_W_COLLAPSED, marginInlineEnd: "auto" }}
          >
            <button
              onClick={handleAvatarClick}
              className="flex items-center justify-center pt-1 rounded-lg hover:bg-black/5 transition-colors p-1"
              aria-label="الحساب والإعدادات"
            >
              <UserAvatarIcon expanded={sidebarExpanded} role={userRole} />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bird toggle — sole controller for sidebar */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen((p) => !p)}
        className="md:hidden fixed top-4 z-[60] flex items-center justify-center p-3 rounded-xl bg-transparent border-none shadow-none hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
        style={{ right: 12 }}
        aria-label={mobileSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        <BirdToggle expanded={mobileSidebarOpen} size={40} />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden
          />
            <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-[min(320px,85vw)] flex flex-col overflow-hidden"
            style={{ background: "var(--bg-secondary)", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}
          >
            <div className="shrink-0" style={{ height: 72 }} />
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              <button
                type="button"
                onClick={() => { startNewChat(); setMobileSidebarOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 mb-3 font-ui transition-colors"
                style={{
                  background: "transparent",
                  border: "var(--border-subtle)",
                  color: "var(--text-primary)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>محادثة جديدة</span>
              </button>

              {SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setCurrentSection(section);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-ui transition-colors"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: currentSection === section ? 700 : 600,
                    background: currentSection === section ? "var(--color-accent-tint-12)" : "transparent",
                    color: currentSection === section ? "var(--color-accent)" : "var(--text-primary)",
                    border: currentSection === section ? "1px solid var(--color-accent-tint-25)" : "1px solid transparent",
                  }}
                >
                  <SectionIcon section={section} color={currentSection === section ? "var(--color-accent)" : "var(--text-secondary)"} />
                  <span>{section}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  router.push("/tahseen-khaleel");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl font-ui transition-colors hover:bg-black/5"
                style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>تحسين خليل</span>
              </button>

              {currentSection === "بحث" && (
                <div className="mt-4 px-1">
                  <input
                    type="text"
                    placeholder="ابحث في المحادثات..."
                    className="w-full px-3 py-2.5 rounded-xl font-ui text-sm"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "var(--border-subtle)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              )}
              {currentSection === "أدوات" && (
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => {
                      setToolsModalOpen(true);
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    <span>أضف أدوات</span>
                  </button>
                </div>
              )}
              {currentSection === "خليخانة" && (
                <p className="mt-4 px-4 py-2 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
                  أنشئ مشروعاً لتنظيم أفكارك
                </p>
              )}
              {currentSection === "دفاتر" && (
                <p className="mt-4 px-4 py-2 font-ui text-sm" style={{ color: "var(--text-tertiary)" }}>
                  لا توجد دفاتر بعد — أنشئ دفتراً جديداً لتبدأ
                </p>
              )}

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <p className="px-4 pb-2 font-ui text-xs" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>المحادثات السابقة</p>
                <ConversationList
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={(id) => {
                    setCurrentConversationId(id);
                    setMobileSidebarOpen(false);
                  }}
                  onNewChat={() => {
                    startNewChat();
                    setMobileSidebarOpen(false);
                  }}
                  groupedConversations={grouped}
                />
              </div>
            </div>
            <div className="shrink-0 p-4 space-y-2" style={{ borderTop: "var(--border-subtle)" }}>
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleAvatarClick();
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-black/5"
                aria-label="الإعدادات"
              >
                <UserAvatarIcon expanded={true} role={userRole} />
                <div className="text-right">
                  <p className="font-ui text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {activeNickname || userDisplayName}
                  </p>
                  <p className="font-ui text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {activeNickname ? userDisplayName : "الإعدادات والحساب"}
                  </p>
                </div>
              </button>
              {activeNickname && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteReasonInput((prev) => !prev)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "#ffeaea", color: "#b02a2a" }}
                  >
                    حذف اللقب
                  </button>
                  {showDeleteReasonInput && (
                    <>
                      <input
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        maxLength={MAX_REASON_LENGTH}
                        placeholder="سبب حذف اللقب..."
                        className="w-full px-2.5 py-2 rounded-lg text-xs"
                        style={{ border: "1px solid #ddd", background: "#fff" }}
                      />
                      <button
                        type="button"
                        disabled={nicknameActionBusy}
                        onClick={deleteActiveNickname}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-60"
                        style={{ background: "#f3f3f3", color: "#555" }}
                      >
                        تأكيد الحذف
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 relative">
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
        initialSettings={{ languageStyle, speechSpeed, voiceId, nickname: activeNickname }}
        initialSection={settingsInitialSection === "apps" ? "apps" : undefined}
        onSave={(s) => {
          setLanguageStyle(s.languageStyle);
          setSpeechSpeed(s.speechSpeed);
          setVoiceId(s.voiceId);
          if (typeof window !== "undefined") {
            localStorage.setItem("khalele_speech_speed", String(s.speechSpeed));
            localStorage.setItem("khalele_voice_id", s.voiceId);
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

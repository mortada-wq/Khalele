"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { HomePillInput } from "@/components/HomePillInput";
import { MessageList } from "@/components/Chat/MessageList";
import { ControlsBar } from "@/components/Chat/ControlsBar";
import { ConversationList } from "@/components/Chat/ConversationList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BirdToggle } from "@/components/BirdToggle";
import { SettingsModal } from "@/components/Settings";
import { CallModeOverlay } from "@/components/Voice/CallModeOverlay";
import { DEFAULT_CHARACTERS } from "@/lib/characters";
import type { Character, LanguageStyle } from "@/lib/characters";
import { detectIntegrationIntent, INTEGRATION_PROMPTS, type IntegrationSuggestion } from "@/lib/connectors";
import { ToolsModal } from "@/components/Tools";
import { ADMIN_TOOLS, getUserTools } from "@/lib/tools";
import { groupConversationsByDate, getOrCreateUserId, USER_ID_KEY } from "@/lib/chat";
import type { Message, Conversation, DateGroup } from "@/lib/chat";

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

/* ── Section navigation icons ── */
function SectionIcon({ section, color }: { section: string; color: string }) {
  const s = 18;
  const st = { color, flexShrink: 0 } as const;

  if (section === "فهرس") return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor" style={st}>
      <path transform="translate(23)" d="M-7.5,16h-10a.5.5,0,0,1-.5-.5.5.5,0,0,1,.5-.5h10a.5.5,0,0,1,.5.5A.5.5,0,0,1-7.5,16Zm.5-5.5a.5.5,0,0,0-.5-.5h-10a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h10A.5.5,0,0,0-7,10.5Zm0-5A.5.5,0,0,0-7.5,5h-10a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h10A.5.5,0,0,0-7,5.5Zm0-5A.5.5,0,0,0-7.5,0h-10a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h10A.5.5,0,0,0-7,.5Zm-13,0a.5.5,0,0,0-.5-.5h-2a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h2A.5.5,0,0,0-20,.5Zm0,5a.5.5,0,0,0-.5-.5h-2a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h2A.5.5,0,0,0-20,5.5Zm0,5a.5.5,0,0,0-.5-.5h-2a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h2A.5.5,0,0,0-20,10.5Zm0,5a.5.5,0,0,0-.5-.5h-2a.5.5,0,0,0-.5.5.5.5,0,0,0,.5.5h2A.5.5,0,0,0-20,15.5Z" />
    </svg>
  );

  if (section === "أدوات") return (
    <svg width={s} height={s} viewBox="0 0 297 297" fill="currentColor" style={st}>
      <path d="M107.184,64.421c0-5.775-4.682-10.457-10.457-10.457H89.93v-6.797c0-3.621,4.398-6.797,9.411-6.797h98.296c5.013,0,9.411,3.176,9.411,6.797v6.797h-6.797c-5.775,0-10.457,4.682-10.457,10.457v0.386h55.422v-0.386c0-5.775-4.682-10.457-10.457-10.457h-6.797v-6.797c0-15.28-13.604-27.711-30.325-27.711H99.342c-16.721,0-30.325,12.431-30.325,27.711v6.797h-6.797c-5.775,0-10.457,4.682-10.457,10.457v0.386h55.422V64.421z"/>
      <path d="M13.625,107.023L0.332,158.535c-0.808,3.132-0.122,6.461,1.859,9.017c1.98,2.557,5.032,4.053,8.267,4.053h49.1l17.795-92.159H47.579C31.737,79.447,16.887,91.534,13.625,107.023z"/>
      <path d="M296.476,157.868l-13.121-50.845c-3.263-15.489-18.113-27.576-33.955-27.576h-29.773l17.795,92.159h49.1c0,0,0.008-0.001,0.013-0.001c0,0,0.005,0,0.007,0.001c5.776,0,10.457-4.682,10.457-10.457C297,160.003,296.816,158.9,296.476,157.868z"/>
      <path d="M10.457,186.245c-2.228,0-4.429-0.313-6.55-0.892l10.662,63.684c2.359,15.996,16.83,28.508,33.01,28.508h27.092l-14.87-91.299H10.457z"/>
      <path d="M286.893,186.245h-0.37h-49.344l-14.87,91.299H249.4c16.181,0,30.652-12.512,33.01-28.51l10.657-63.651c-1.952,0.526-3.998,0.824-6.106,0.858L286.893,186.245z"/>
      <path d="M96.727,79.447l-17.795,92.159h41.847v-27.711c0-5.775,4.682-10.457,10.457-10.457h34.508c5.775,0,10.457,4.682,10.457,10.457v27.711h41.847l-17.795-92.159H96.727z"/>
      <path d="M176.201,195.657c0,5.775-4.682,10.457-10.457,10.457h-34.508c-5.775,0-10.457-4.682-10.457-10.457v-9.411H80.991l14.87,91.299h107.183l14.87-91.299h-41.712V195.657z"/>
    </svg>
  );

  return (
    <svg width={s} height={s} viewBox="0 0 28.704 28.704" fill="currentColor" style={st}>
      <path d="M21.172,17.525c0.208-0.175,0.402-0.367,0.605-0.547C21.008,17.733,20.6,18.053,21.172,17.525z M27.162,19.768c0.047,0.734-0.102,1.527-0.499,2.16c-0.408,0.662-1.032,1.116-1.702,1.397c-0.672,0.282-1.383,0.408-2.087,0.455c-1.167,0.076-2.319-0.067-3.445-0.297c-1.219,3.187-3.06,5.221-5.119,5.221c-2.002,0-3.796-1.935-5.014-4.976c-1.029,0.232-2.082,0.38-3.151,0.348c-0.703-0.023-1.422-0.124-2.101-0.382c-0.679-0.257-1.319-0.689-1.751-1.336c-0.421-0.618-0.595-1.406-0.573-2.141c0.017-0.744,0.195-1.461,0.445-2.138c0.484-1.294,1.215-2.461,2.046-3.532c-0.109-0.126-0.222-0.25-0.328-0.379c-0.205,0.114-0.438,0.185-0.69,0.185c-0.79,0-1.431-0.641-1.431-1.431c0-0.456,0.218-0.858,0.55-1.12c-0.048-0.095-0.104-0.184-0.149-0.281c-0.297-0.642-0.529-1.326-0.605-2.051C1.48,8.752,1.584,7.975,1.961,7.312C2.331,6.645,2.95,6.143,3.62,5.829C4.291,5.51,5.013,5.347,5.73,5.265c1.145-0.125,2.287-0.056,3.406,0.12C10.354,2.107,12.219,0,14.31,0c2.046,0,3.878,2.013,5.096,5.168c1.055-0.192,2.134-0.281,3.221-0.203c0.72,0.058,1.446,0.194,2.13,0.49c0.681,0.293,1.311,0.764,1.714,1.43c0.391,0.637,0.527,1.419,0.474,2.138c-0.049,0.727-0.259,1.418-0.532,2.069c-0.484,1.137-1.178,2.15-1.941,3.097c0.867,1.043,1.637,2.182,2.168,3.459C26.913,18.315,27.119,19.026,27.162,19.768z M19.705,6.019c0.458,1.383,0.804,2.948,1.012,4.636c1.314,1.008,2.549,2.119,3.635,3.385c0.003,0.004,0.006,0.008,0.009,0.012c0.709-0.957,1.324-1.983,1.735-3.084c0.232-0.637,0.396-1.302,0.407-1.964c0.014-0.661-0.133-1.305-0.497-1.839c-0.346-0.512-0.892-0.893-1.492-1.115c-0.605-0.228-1.267-0.323-1.928-0.342C21.626,5.681,20.658,5.812,19.705,6.019z M15.365,21.399c-0.28,0.148-0.56,0.296-0.845,0.434c1.367,0.577,2.777,1.047,4.228,1.351c0.077,0.016,0.155,0.026,0.232,0.041c0.743-2.001,1.238-4.485,1.383-7.211c-0.637-0.144-1.113-0.711-1.113-1.392c0-0.689,0.488-1.264,1.137-1.399c-0.019-0.539-0.049-1.072-0.095-1.592c-0.962-0.733-1.967-1.416-3.007-2.024c-0.988-0.586-2.011-1.11-3.053-1.585c-1.027,0.512-2.032,1.071-2.999,1.692c-1.011,0.642-1.985,1.356-2.915,2.117c-0.067,0.819-0.107,1.659-0.107,2.521c0,1.37,0.091,2.69,0.256,3.94c0.119,0.132,0.109,0.154,0.011,0.097c0.256,1.891,0.689,3.603,1.252,5.055c0.174-0.037,0.348-0.069,0.52-0.11c1.44-0.354,2.832-0.874,4.178-1.499c-1.153-0.512-2.278-1.089-3.361-1.731c1.097,0.641,2.237,1.212,3.407,1.709c0.294-0.137,0.583-0.287,0.873-0.435c-0.183-0.24-0.295-0.537-0.295-0.862c0-0.791,0.641-1.432,1.432-1.432c0.604,0,1.118,0.375,1.329,0.904c0.002-0.001,0.004-0.002,0.005-0.003c-0.002,0.001-0.004,0.002-0.005,0.003c0.065,0.164,0.103,0.341,0.103,0.528c0,0.791-0.641,1.432-1.432,1.432C16.028,21.948,15.627,21.731,15.365,21.399z M7.673,14.352c0-0.698,0.031-1.379,0.076-2.051c-0.967,0.828-1.89,1.712-2.71,2.68c-0.031,0.037-0.06,0.076-0.091,0.113c1.441,1.264,2.368,2.097,2.915,2.606C7.743,16.624,7.673,15.507,7.673,14.352z M10.657,8.805c0.748-0.474,1.524-0.907,2.313-1.318c-1.039-0.414-2.096-0.778-3.179-1.046C9.644,6.406,9.496,6.379,9.349,6.347C8.966,7.56,8.666,8.913,8.472,10.373C9.18,9.823,9.905,9.293,10.657,8.805z M20.132,10.217c-0.206-1.486-0.526-2.855-0.927-4.078c-0.198,0.049-0.398,0.095-0.594,0.149c-1.072,0.306-2.115,0.707-3.139,1.156c0.802,0.382,1.592,0.788,2.356,1.234C18.62,9.153,19.384,9.674,20.132,10.217z M9.644,5.475C9.76,5.497,9.878,5.513,9.993,5.537c1.45,0.304,2.856,0.765,4.216,1.332c1.339-0.615,2.728-1.126,4.167-1.481c0.173-0.042,0.349-0.074,0.523-0.112C17.78,2.379,16.14,0.538,14.31,0.538C12.439,0.538,10.763,2.461,9.644,5.475z M4.316,14.406c0.003-0.004,0.006-0.008,0.009-0.012c1.052-1.318,2.262-2.483,3.556-3.546c0.195-1.671,0.52-3.229,0.96-4.61c-1.01-0.192-2.032-0.301-3.044-0.236c-0.662,0.044-1.32,0.162-1.915,0.411C3.287,6.659,2.761,7.05,2.425,7.586C2.087,8.12,1.96,8.778,1.997,9.436c0.036,0.66,0.221,1.32,0.478,1.948c0.034,0.083,0.079,0.161,0.115,0.243c0.184-0.086,0.387-0.137,0.603-0.137c0.79,0,1.431,0.641,1.431,1.431c0,0.47-0.23,0.884-0.58,1.144C4.132,14.182,4.226,14.292,4.316,14.406z M9.222,23.551c-0.62-1.6-1.075-3.5-1.327-5.578c-0.088-0.067-0.177-0.136-0.267-0.208c-0.989-0.775-1.924-1.62-2.789-2.536c-0.791,0.962-1.508,1.992-1.989,3.121c-0.514,1.202-0.772,2.615-0.096,3.732c0.315,0.53,0.852,0.95,1.454,1.208c0.607,0.265,1.28,0.396,1.957,0.45C7.179,23.815,8.207,23.733,9.222,23.551z M18.921,23.374c-0.069-0.016-0.138-0.028-0.206-0.044c-1.458-0.36-2.87-0.868-4.24-1.473c-1.348,0.653-2.742,1.21-4.187,1.622c-0.163,0.045-0.33,0.083-0.495,0.124c1.117,2.794,2.725,4.563,4.516,4.563C16.151,28.166,17.801,26.303,18.921,23.374z M25.968,17.941c-0.521-1.112-1.273-2.116-2.099-3.049c-0.652,0.742-1.356,1.431-2.092,2.086c0.558-0.548,1.305-1.326,2.01-2.181c-0.043-0.048-0.083-0.098-0.127-0.146c-0.854-0.94-1.809-1.791-2.803-2.585c0.028,0.38,0.052,0.762,0.066,1.151c0.674,0.116,1.188,0.699,1.188,1.406c0,0.715-0.526,1.302-1.21,1.408c-0.148,2.737-0.653,5.238-1.412,7.284c1.115,0.181,2.247,0.253,3.358,0.131c0.675-0.078,1.342-0.232,1.938-0.519c0.594-0.279,1.116-0.718,1.414-1.26C26.833,20.527,26.523,19.125,25.968,17.941z"/>
    </svg>
  );
}

const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;

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
    return [{ id, title: "محادثة جديدة", messages: [], updatedAt: new Date().toISOString() }];
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
    if (typeof window === "undefined") return "Zeina";
    return localStorage.getItem("khalele_voice_id") || "Zeina";
  });
  const [useSearch, setUseSearch] = useState(false);
  const [empathyMode, setEmpathyMode] = useState(false);
  const [ramadanMode, setRamadanMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("فهرس");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<string | undefined>();
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [suggestionBanner, setSuggestionBanner] = useState<IntegrationSuggestion>(null);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [userToolIds, setUserToolIds] = useState<string[]>([]);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const userIdRef = useRef<string>("");
  const incognitoIdRef = useRef<string>("");
  const dismissedBannersRef = useRef<Set<IntegrationSuggestion>>(new Set());

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

  const SECTIONS = ["فهرس", "أدوات", "خليخانة"] as const;

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages ?? [];

  useEffect(() => {
    if (!currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    if (typeof window !== "undefined") setUserToolIds(getUserTools());
  }, []);

  useEffect(() => {
    if (toolsModalOpen) setUserToolIds(getUserTools());
  }, [toolsModalOpen]);

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
            const mapped: Conversation[] = list.map((c: { conversationId: string; title: string; messages: { id: string; role: string; content: string }[]; updatedAt: string }) => ({
              id: c.conversationId,
              title: c.title,
              messages: (c.messages || []).map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
              updatedAt: c.updatedAt,
            }));
            setConversations(mapped);
            setCurrentConversationId(mapped[0].id);
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
    const conv = conversations.find((c) => c.id === convId) || { messages: [] };
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
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(id);
    try {
      await fetch("/api/conversations", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ conversationId: id, title: newConv.title, messages: [] }),
      });
    } catch {
      // Fallback: in-memory only
    }
  };

  const grouped = groupConversationsByDate(conversations);
  const hasAnyConversations =
    grouped.today.length > 0 ||
    grouped.yesterday.length > 0 ||
    grouped.last7.length > 0 ||
    grouped.older.length > 0;

  return (
    <div className="h-screen flex overflow-hidden" dir="rtl" style={{ background: "#ebebec" }}>
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: sidebarExpanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: sidebarExpanded ? "#ffffff" : "#ebebec",
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
              <div className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section}
                    onClick={() => setCurrentSection(section)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-ui transition-colors"
                    style={{
                      fontSize: "1rem",
                      fontWeight: currentSection === section ? 600 : 400,
                      background: currentSection === section ? "var(--color-accent-tint-12)" : "transparent",
                      color: currentSection === section ? "var(--color-accent)" : "#000000",
                      border: currentSection === section ? "1px solid var(--color-accent-tint-25)" : "1px solid transparent",
                    }}
                  >
                    <SectionIcon section={section} color={currentSection === section ? "var(--color-accent)" : "#999"} />
                    <span>{section}</span>
                  </button>
                ))}
              </div>

              {currentSection === "فهرس" && (
                <ConversationList
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={setCurrentConversationId}
                  onNewChat={startNewChat}
                  groupedConversations={grouped}
                />
              )}

              {currentSection === "أدوات" && (
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => setToolsModalOpen(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
                    style={{ color: "#000000" }}
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
                            style={{ color: "#000000" }}
                          >
                            {tool.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-4 py-2 font-ui text-sm" style={{ color: "#8c8c8c" }}>
                      لم تضف أدوات بعد — اضغط أضف أدوات لاختيارها
                    </p>
                  )}
                </div>
              )}

              {currentSection === "خليخانة" && (
                <p className="mt-4 px-4 py-2 font-ui text-sm" style={{ color: "#8c8c8c" }}>
                  أنشئ مشروعاً لتنظيم أفكارك
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div
          className="shrink-0 flex flex-col items-center gap-2 pb-4 pt-2"
          style={{ width: SIDEBAR_W_COLLAPSED, marginInlineEnd: "auto" }}
        >
          <ThemeToggle />
          <button
            onClick={handleAvatarClick}
            className="flex items-center justify-center pt-1 rounded-lg hover:bg-black/5 transition-colors p-1"
            aria-label="الحساب والإعدادات"
          >
            <UserAvatarIcon expanded={sidebarExpanded} role={userRole} />
          </button>
        </div>
      </aside>

      {/* Mobile menu - BirdToggle (same icon as desktop sidebar) */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed top-4 z-50 flex items-center justify-center p-3 rounded-xl bg-transparent border-none shadow-none hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation"
        style={{ right: 12 }}
        aria-label="فتح القائمة"
      >
        <BirdToggle expanded={false} size={40} />
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
            style={{ background: "#ffffff", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 -m-2 rounded-lg hover:bg-black/5"
                aria-label="إغلاق"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <span className="font-ui font-semibold" style={{ color: "#000000" }}>القائمة</span>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              {SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setCurrentSection(section);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-ui transition-colors"
                  style={{
                    fontSize: "1rem",
                    fontWeight: currentSection === section ? 600 : 400,
                    background: currentSection === section ? "var(--color-accent-tint-12)" : "transparent",
                    color: currentSection === section ? "var(--color-accent)" : "#000000",
                    border: currentSection === section ? "1px solid var(--color-accent-tint-25)" : "1px solid transparent",
                  }}
                >
                  <SectionIcon section={section} color={currentSection === section ? "var(--color-accent)" : "#999"} />
                  <span>{section}</span>
                </button>
              ))}
              {currentSection === "فهرس" && (
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
              )}
              {currentSection === "أدوات" && (
                <div className="mt-4 space-y-4">
                  <button
                    onClick={() => {
                      setToolsModalOpen(true);
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
                    style={{ color: "#000000" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    <span>أضف أدوات</span>
                  </button>
                </div>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2 p-4 border-t border-[#e5e5e5]">
              <ThemeToggle />
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleAvatarClick();
                }}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-black/5"
                aria-label="الإعدادات"
              >
                <UserAvatarIcon expanded={true} role={userRole} />
              </button>
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
        <MessageList
          messages={messages}
          isLoading={isLoading}
          speechSpeed={speechSpeed}
          voiceId={voiceId}
          onSendMessage={sendMessage}
          onRegenerate={regenerateMessage}
        />

        <ControlsBar
          languageStyle={languageStyle}
          onLanguageStyleChange={setLanguageStyle}
          useSearch={useSearch}
          onUseSearchChange={setUseSearch}
          empathyMode={empathyMode}
          onEmpathyModeChange={setEmpathyMode}
          ramadanMode={ramadanMode}
          onRamadanModeChange={setRamadanMode}
        />

        {suggestionBanner && (
          <div className="shrink-0 px-4 md:px-6 pb-2">
            <div
              className="max-w-2xl mx-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-ui text-xs md:text-sm"
              style={{ background: "var(--color-accent-tint-10)", border: "1px solid var(--color-accent-tint-25)" }}
            >
              <span style={{ color: "#000000" }}>{INTEGRATION_PROMPTS[suggestionBanner]}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsInitialSection("apps");
                    setSettingsOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg font-medium text-xs md:text-sm"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  ربط
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionBanner(null)}
                  className="p-1.5 rounded-lg hover:bg-black/5"
                  style={{ color: "#6b6b6b" }}
                  aria-label="إغلاق"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
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
              placeholder="اكتب رسالتك..."
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
        initialSettings={{ languageStyle, speechSpeed, voiceId }}
        initialSection={settingsInitialSection === "apps" ? "apps" : undefined}
        onSave={(s) => {
          setLanguageStyle(s.languageStyle);
          setSpeechSpeed(s.speechSpeed);
          setVoiceId(s.voiceId);
          if (typeof window !== "undefined") {
            localStorage.setItem("khalele_speech_speed", String(s.speechSpeed));
            localStorage.setItem("khalele_voice_id", s.voiceId);
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
    <Suspense fallback={<div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}><span style={{ color: "#8c8c8c" }}>جاري التحميل...</span></div>}>
      <ChatPageContent />
    </Suspense>
  );
}

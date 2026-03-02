"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MaterialSymbol } from "react-material-symbols";
import type { LanguageStyle } from "@/lib/characters";
import { DEFAULT_ACCENT, getStoredAccent, savePalette, resetPalette } from "@/lib/theme-color";
import { ARABIC_VOICES, type VoiceOption } from "@/lib/voices";

export interface KheleelSettings {
  // عام
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  // الصوت
  speechSpeed: number;
  voiceId: string;
  autoResponse: boolean;
  // اللغة والأسلوب
  languageStyle: LanguageStyle;
  // التخصيص
  tone: "formal" | "friendly" | "casual";
  enthusiasm: "low" | "medium" | "high";
  nickname: string;
  customInstructions: string;
  // الإشعارات
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  // البيانات
  dataSharing: boolean;
  // الحساب
  accountEmail: string;
}

const DEFAULT_SETTINGS: KheleelSettings = {
  accentColor: DEFAULT_ACCENT,
  fontSize: "medium",
  compactMode: false,
  speechSpeed: 1,
  voiceId: "ar-XA-Wavenet-A",
  autoResponse: false,
  languageStyle: "easy_arabic",
  tone: "friendly",
  enthusiasm: "medium",
  nickname: "",
  customInstructions: "",
  notificationsEnabled: true,
  soundEnabled: true,
  dataSharing: false,
  accountEmail: "",
};

const SECTIONS = [
  { id: "general", label: "عام", icon: "settings" as const },
  { id: "apps", label: "ربط حساباتك", icon: "extension" as const },
  { id: "voice", label: "الصوت", icon: "mic" as const },
  { id: "language", label: "اللغة والأسلوب", icon: "translate" as const },
  { id: "personalization", label: "التخصيص", icon: "tune" as const },
  { id: "notifications", label: "الإشعارات", icon: "notifications" as const },
  { id: "data", label: "البيانات", icon: "storage" as const },
  { id: "account", label: "الحساب", icon: "person" as const },
] as const;

const RECOMMENDED_INTEGRATIONS = [
  {
    id: "google_drive",
    label: "Google Drive",
    description: "حلل المستندات، لخّص العروض، استخرج النقاط المهمة",
    icon: "folder" as const,
  },
  {
    id: "gmail",
    label: "Gmail",
    description: "مسودة ردود، تلخيص الرسائل، استخراج المهام",
    icon: "mail" as const,
  },
  {
    id: "google_calendar",
    label: "Google Calendar",
    description: "جدولة ذكية، كشف التعارضات، تخطيط الاجتماعات",
    icon: "calendar_month" as const,
  },
  {
    id: "github",
    label: "GitHub",
    description: "دعم المطورين وفرق البرمجة",
    icon: "code" as const,
  },
] as const;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialSettings?: Partial<KheleelSettings>;
  initialSection?: (typeof SECTIONS)[number]["id"];
  onSave?: (settings: KheleelSettings) => void;
}

const FEEDBACK_CATEGORIES = [
  { id: "develop", label: "تطوير خليلي" },
  { id: "ui", label: "ملاحظة عن واجهة التطبيق" },
  { id: "behavior", label: "ملاحظة عن سلوك أو إجابة خليل" },
  { id: "suggestion", label: "اقتراح" },
] as const;

function VoicePreviewButton({ voice, speed }: { voice: VoiceOption; speed: number }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setState("idle");
  }, []);

  const play = useCallback(async () => {
    if (state === "playing") {
      stop();
      return;
    }
    stop();
    setState("loading");
    try {
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voice.preview, voiceId: voice.id, speed }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => stop();
      audio.onerror = () => stop();
      await audio.play();
      setState("playing");
    } catch {
      stop();
    }
  }, [voice, speed, state, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <button
      type="button"
      onClick={play}
      disabled={state === "loading"}
      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all"
      style={{
        background: state === "playing" ? "var(--color-accent)" : "var(--color-accent-tint-12)",
        color: state === "playing" ? "#fff" : "var(--color-accent)",
      }}
      title="جرّب الصوت"
    >
      {state === "loading" ? (
        <MaterialSymbol icon="progress_activity" size={18} fill={false} className="animate-spin" />
      ) : state === "playing" ? (
        <MaterialSymbol icon="stop" size={18} fill />
      ) : (
        <MaterialSymbol icon="play_arrow" size={18} fill />
      )}
    </button>
  );
}

export function SettingsModal({ open, onClose, initialSettings, initialSection, onSave }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<(typeof SECTIONS)[number]["id"]>(initialSection ?? "general");
  const [settings, setSettings] = useState<KheleelSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  }));
  const [feedbackCategory, setFeedbackCategory] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (open && initialSection) setActiveSection(initialSection);
  }, [open, initialSection]);

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const stored = getStoredAccent();
      if (stored) setSettings((s) => ({ ...s, accentColor: stored }));
    }
  }, [open]);

  const update = <K extends keyof KheleelSettings>(key: K, value: KheleelSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(settings);
    onClose();
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    setFeedbackSending(true);
    try {
      const res = await fetch("/api/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: feedbackCategory ? FEEDBACK_CATEGORIES.find((c) => c.id === feedbackCategory)?.label : undefined,
          message: feedbackMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFeedbackSent(true);
      setFeedbackMessage("");
      setFeedbackCategory("");
    } catch {
      alert("فشل إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setFeedbackSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden font-ui"
        style={{ background: "#ffffff", color: "#231f20" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e5e5e5" }}>
          <h2 className="text-xl font-semibold">الإعدادات</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5" aria-label="إغلاق">
            <MaterialSymbol icon="close" size={20} fill={false} style={{ color: "#5a5a5a" }} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar nav */}
          <nav
            className="sidebar-scroll w-48 shrink-0 border-l overflow-y-auto py-3"
            style={{ borderColor: "#e5e5e5", background: "#fafafa" }}
          >
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-right text-sm transition-colors"
                style={{
                  background: activeSection === s.id ? "var(--color-accent-tint-12)" : "transparent",
                  color: activeSection === s.id ? "var(--color-accent)" : "#5a5a5a",
                  fontWeight: activeSection === s.id ? 600 : 400,
                }}
              >
                <MaterialSymbol
                  icon={s.icon}
                  size={20}
                  fill={false}
                  className="shrink-0"
                  style={{ color: "inherit" }}
                />
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="sidebar-scroll flex-1 overflow-y-auto p-6">
            {/* عام */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  عام
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">لون خليلك يا ولد</label>
                  <p className="text-xs mb-2" style={{ color: "#6b6b6b" }}>
                    اختر لوناً واحداً — التطبيق يغيّر كل الألوان تلقائياً
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => {
                        const v = e.target.value;
                        update("accentColor", v);
                        savePalette(v);
                        e.target.blur();
                      }}
                      className="w-12 h-12 rounded-xl cursor-pointer border"
                      style={{ borderColor: "#e0e0e0" }}
                    />
                    <span className="text-sm" style={{ color: "#6b6b6b" }}>{settings.accentColor}</span>
                    <button
                      type="button"
                      onClick={() => {
                        update("accentColor", DEFAULT_ACCENT);
                        resetPalette();
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: "#f0f0f0", color: "#5a5a5a" }}
                    >
                      إعادة تعيين
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">حجم الخط</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => update("fontSize", e.target.value as KheleelSettings["fontSize"])}
                    className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "#e0e0e0" }}
                  >
                    <option value="small">صغير</option>
                    <option value="medium">متوسط</option>
                    <option value="large">كبير</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => update("compactMode", e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm">وضع مضغوط</span>
                </label>
              </div>
            )}

            {/* ربط حساباتك - Recommended Integrations */}
            {activeSection === "apps" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  ربط حساباتك
                </h3>
                <p className="text-sm" style={{ color: "#6b6b6b", lineHeight: 1.6 }}>
                  ربط حساباتك لتمكين المساعد من الوصول إلى ملفاتك ورسائلك بأمان.
                </p>
                <div className="space-y-3">
                  {RECOMMENDED_INTEGRATIONS.map((int) => (
                    <div
                      key={int.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border"
                      style={{ borderColor: "#e5e5e5", background: "#fafafa" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--color-accent-tint-12)" }}
                        >
                          <MaterialSymbol
                            icon={int.icon}
                            size={24}
                            fill={false}
                            style={{ color: "var(--color-accent)" }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{int.label}</p>
                          <p className="text-xs truncate" style={{ color: "#6b6b6b" }}>
                            {int.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: "#e5e5e5",
                          color: "#8c8c8c",
                          cursor: "not-allowed",
                        }}
                      >
                        قريباً
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: "#8c8c8c" }}>
                  التكاملات الموصى بها — جودة فوق الكمية.
                </p>
              </div>
            )}

            {/* الصوت */}
            {activeSection === "voice" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  الصوت
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-3">اختر صوت خليل</label>
                  <div className="space-y-2">
                    {ARABIC_VOICES.map((voice) => {
                      const selected = settings.voiceId === voice.id;
                      return (
                        <div
                          key={voice.id}
                          onClick={() => update("voiceId", voice.id)}
                          className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                          style={{
                            borderColor: selected ? "var(--color-accent)" : "#e5e5e5",
                            background: selected ? "var(--color-accent-tint-08)" : "#fafafa",
                          }}
                        >
                          <div
                            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{
                              background: selected ? "var(--color-accent)" : "#e5e5e5",
                              color: selected ? "#fff" : "#8c8c8c",
                            }}
                          >
                            {voice.gender === "female" ? "♀" : "♂"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{voice.nameAr}</span>
                              <span className="text-xs" style={{ color: "#8c8c8c" }}>({voice.nameEn})</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  background: voice.gender === "female" ? "#fce4ec" : "#e3f2fd",
                                  color: voice.gender === "female" ? "#c62828" : "#1565c0",
                                }}
                              >
                                {voice.gender === "female" ? "أنثى" : "ذكر"}
                              </span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  background: voice.engine === "standard" ? "#fff3e0" : "#e8f5e9",
                                  color: voice.engine === "standard" ? "#e65100" : "#2e7d32",
                                }}
                              >
                                {voice.engine === "standard" ? "قياسي" : "متقدم"}
                              </span>
                            </div>
                          </div>

                          <VoicePreviewButton voice={voice} speed={settings.speechSpeed} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">سرعة الكلام</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs shrink-0" style={{ color: "#8c8c8c" }}>بطيء</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.speechSpeed}
                      onChange={(e) => update("speechSpeed", parseFloat(e.target.value))}
                      className="flex-1 accent-accent"
                    />
                    <span className="text-xs shrink-0" style={{ color: "#8c8c8c" }}>سريع</span>
                  </div>
                  <p className="text-center text-sm mt-1" style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                    {settings.speechSpeed}x
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoResponse}
                    onChange={(e) => update("autoResponse", e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm">الرد الصوتي التلقائي</span>
                </label>
              </div>
            )}

            {/* اللغة والأسلوب */}
            {activeSection === "language" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  اللغة والأسلوب
                </h3>
                <div
                  className="p-4 rounded-xl border-2"
                  style={{
                    borderColor: settings.languageStyle === "easy_arabic" ? "var(--color-accent)" : "#e0e0e0",
                    background: settings.languageStyle === "easy_arabic" ? "var(--color-accent-tint-08)" : "#fafafa",
                  }}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="font-medium">فصحى</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.languageStyle === "easy_arabic"}
                      onClick={() => update("languageStyle", settings.languageStyle === "easy_arabic" ? "formal_msa" : "easy_arabic")}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{
                        background: settings.languageStyle === "easy_arabic" ? "var(--color-accent)" : "#d0d0d0",
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                        style={{
                          right: settings.languageStyle === "easy_arabic" ? "2px" : "22px",
                        }}
                      />
                    </button>
                    <span className="font-medium">عربية بسيطة</span>
                  </div>
                  <p className="text-sm" style={{ color: "#6b6b6b", lineHeight: 1.6 }}>
                    خليل يفهم كل اللهجات العربية — تكلم كما تحب. يختار الرد بالفصحى الرسمية أو بالعربية السهلة حسب إعدادك.
                  </p>
                </div>
              </div>
            )}

            {/* التخصيص */}
            {activeSection === "personalization" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  التخصيص
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">الأسلوب</label>
                  <select
                    value={settings.tone}
                    onChange={(e) => update("tone", e.target.value as KheleelSettings["tone"])}
                    className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "#e0e0e0" }}
                  >
                    <option value="formal">رسمي</option>
                    <option value="friendly">ودود</option>
                    <option value="casual">غير رسمي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الحماس</label>
                  <select
                    value={settings.enthusiasm}
                    onChange={(e) => update("enthusiasm", e.target.value as KheleelSettings["enthusiasm"])}
                    className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "#e0e0e0" }}
                  >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">مرتفع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">اللقب (كيف يناديك خليل)</label>
                  <input
                    type="text"
                    value={settings.nickname}
                    onChange={(e) => update("nickname", e.target.value)}
                    placeholder="مثال: أبو أحمد"
                    className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "#e0e0e0" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تعليمات مخصصة</label>
                  <textarea
                    value={settings.customInstructions}
                    onChange={(e) => update("customInstructions", e.target.value)}
                    placeholder="أضف تعليمات خاصة لخليل..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: "#e0e0e0" }}
                  />
                </div>
              </div>
            )}

            {/* الإشعارات */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  الإشعارات
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => update("notificationsEnabled", e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm">تفعيل الإشعارات</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => update("soundEnabled", e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm">صوت الإشعارات</span>
                </label>
              </div>
            )}

            {/* البيانات */}
            {activeSection === "data" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  البيانات
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dataSharing}
                    onChange={(e) => update("dataSharing", e.target.checked)}
                    className="rounded accent-accent"
                  />
                  <span className="text-sm">مشاركة البيانات لتحسين الخدمة</span>
                </label>

                {/* رسالة لإدارة التطبيق */}
                <div className="pt-4 border-t" style={{ borderColor: "#e5e5e5" }}>
                  <p className="text-sm font-medium mb-2">أرسل رسالة لإدارة التطبيق لتطوير وتحسين خليلي</p>
                  <p className="text-xs mb-3" style={{ color: "#6b6b6b" }}>
                    البريد: <a href="mailto:hello@kheleel.com" className="hover:underline" style={{ color: "var(--color-accent)" }}>hello@kheleel.com</a>
                  </p>
                  {feedbackSent ? (
                    <div className="p-4 rounded-xl" style={{ background: "var(--color-accent-tint-08)", border: "1px solid var(--color-accent-tint-25)" }}>
                      <p className="text-sm font-medium mb-2" style={{ color: "var(--color-accent)" }}>شكراً لمشاركتك في تحسين خليلي!</p>
                      <p className="text-sm mb-3" style={{ color: "#5a5a5a", lineHeight: 1.6 }}>
                        خليلي منتج عام وغير ربحي، صُنع لمن لا يقدر على تحمل التكاليف. مساهمتك تساعدنا على جعله أفضل للجميع.
                      </p>
                      <button
                        type="button"
                        onClick={() => setFeedbackSent(false)}
                        className="text-xs font-medium"
                        style={{ color: "var(--color-accent)" }}
                      >
                        إرسال رسالة أخرى
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs mb-2" style={{ color: "#6b6b6b" }}>ما موضوع رسالتك؟</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {FEEDBACK_CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFeedbackCategory(feedbackCategory === c.id ? "" : c.id)}
                            className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                            style={{
                              background: feedbackCategory === c.id ? "var(--color-accent-tint-20)" : "#f0f0f0",
                              color: feedbackCategory === c.id ? "var(--color-accent)" : "#5a5a5a",
                              border: feedbackCategory === c.id ? "1px solid var(--color-accent)" : "1px solid transparent",
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="اكتب رسالتك هنا..."
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border text-sm resize-none mb-3"
                        style={{ borderColor: "#e0e0e0" }}
                      />
                      <button
                        type="button"
                        onClick={handleSendFeedback}
                        disabled={feedbackSending || !feedbackMessage.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "var(--color-accent)" }}
                      >
                        {feedbackSending ? "جاري الإرسال..." : "إرسال"}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm" style={{ color: "#6b6b6b" }}>
                  إدارة بيانات المحادثات والتصدير.
                </p>
              </div>
            )}

            {/* الحساب */}
            {activeSection === "account" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-accent)" }}>
                  الحساب
                </h3>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={settings.accountEmail}
                    onChange={(e) => update("accountEmail", e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "#e0e0e0" }}
                  />
                </div>
                <p className="text-sm" style={{ color: "#6b6b6b" }}>
                  إدارة الحساب والأمان.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: "#e5e5e5" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: "#f0f0f0", color: "#5a5a5a" }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}

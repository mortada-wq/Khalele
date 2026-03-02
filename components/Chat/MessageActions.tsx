"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Copy,
  Check,
  Share2,
  Play,
  ThumbsDown,
  ThumbsUp,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";

interface MessageActionsProps {
  messageId: string;
  content: string;
  speechSpeed?: number;
  voiceId?: string;
  onRegenerate?: () => void;
}

type FeedbackReason = "inaccurate" | "not_helpful" | "too_long" | "other";

const FEEDBACK_REASONS: { value: FeedbackReason; label: string }[] = [
  { value: "inaccurate", label: "غير دقيق" },
  { value: "not_helpful", label: "غير مفيد" },
  { value: "too_long", label: "طويل جداً" },
  { value: "other", label: "سبب آخر" },
];

function VoiceWaveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="voice-wave-bars">
      <rect x="2" y="8" width="3" height="8" rx="1" />
      <rect x="7" y="5" width="3" height="14" rx="1" />
      <rect x="12" y="3" width="3" height="18" rx="1" />
      <rect x="17" y="6" width="3" height="12" rx="1" />
    </svg>
  );
}

export function MessageActions({
  messageId,
  content,
  speechSpeed = 1,
  voiceId,
  onRegenerate,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [showDislikeForm, setShowDislikeForm] = useState(false);
  const [dislikeReason, setDislikeReason] = useState<FeedbackReason>("inaccurate");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Audio state
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [content]);

  const handleShare = useCallback(async () => {
    const shareData = { title: "خليلي", text: content };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — fall back to copy
        await navigator.clipboard.writeText(content);
      }
    } else {
      await navigator.clipboard.writeText(content);
    }
  }, [content]);

  const handlePlay = useCallback(async () => {
    if (audioState === "playing" && audioRef.current) {
      audioRef.current.pause();
      setAudioState("paused");
      return;
    }

    if (audioState === "paused" && audioRef.current) {
      audioRef.current.play();
      setAudioState("playing");
      return;
    }

    // Stop any existing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setAudioState("loading");
    try {
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, speed: speechSpeed, voiceId }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setAudioState("idle");
        audioRef.current = null;
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
      };

      audio.onerror = () => setAudioState("idle");
      await audio.play();
      setAudioState("playing");
    } catch {
      // Fallback to Web Speech API
      try {
        const u = new SpeechSynthesisUtterance(content);
        u.lang = "ar-SA";
        u.rate = speechSpeed;
        u.onend = () => setAudioState("idle");
        u.onerror = () => setAudioState("idle");
        speechSynthesis.speak(u);
        setAudioState("playing");
      } catch {
        setAudioState("idle");
      }
    }
  }, [content, speechSpeed, voiceId, audioState]);

  const sendFeedback = useCallback(
    async (type: "like" | "dislike", reason?: FeedbackReason) => {
      setSubmittingFeedback(true);
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            feedbackType: type,
            reason: reason || undefined,
            originalResponse: content,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // Silently fail — don't disrupt UX
      } finally {
        setSubmittingFeedback(false);
      }
    },
    [messageId, content]
  );

  const handleLike = useCallback(async () => {
    if (liked === "up") return;
    setLiked("up");
    setShowDislikeForm(false);
    await sendFeedback("like");
  }, [liked, sendFeedback]);

  const handleDislike = useCallback(async () => {
    if (liked === "down") {
      setShowDislikeForm(false);
      return;
    }
    setShowDislikeForm(true);
  }, [liked]);

  const submitDislike = useCallback(async () => {
    setLiked("down");
    setShowDislikeForm(false);
    await sendFeedback("dislike", dislikeReason);
  }, [dislikeReason, sendFeedback]);

  const handleRegenerate = useCallback(async () => {
    if (!onRegenerate || regenerating) return;
    setRegenerating(true);
    try {
      onRegenerate();
    } finally {
      setTimeout(() => setRegenerating(false), 1000);
    }
  }, [onRegenerate, regenerating]);

  const iconBtnClass =
    "p-1.5 rounded-md transition-all duration-150 hover:bg-black/[0.06] active:scale-95 disabled:opacity-30 disabled:pointer-events-none";

  const iconColor = (active: boolean, activeColor: string) =>
    active ? activeColor : "#999";

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-0.5 message-actions-bar">
        {/* Copy */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCopy}
            className={iconBtnClass}
            title={copied ? "تم النسخ!" : "نسخ"}
            aria-label={copied ? "تم النسخ!" : "نسخ"}
          >
            {copied ? (
              <Check size={16} style={{ color: "#2E8B57" }} />
            ) : (
              <Copy size={16} style={{ color: "#999" }} />
            )}
          </button>
          {copied && (
            <span
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-ui whitespace-nowrap pointer-events-none"
              style={{
                background: "#231f20",
                color: "#fff",
                animation: "message-slide-in 0.2s ease-out",
              }}
            >
              تم النسخ!
            </span>
          )}
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className={iconBtnClass}
          title="مشاركة"
          aria-label="مشاركة"
        >
          <Share2 size={16} style={{ color: "#999" }} />
        </button>

        {/* Play Audio */}
        <button
          type="button"
          onClick={handlePlay}
          className={iconBtnClass}
          disabled={audioState === "loading"}
          title={audioState === "playing" ? "إيقاف مؤقت" : audioState === "paused" ? "متابعة" : "استمع"}
          aria-label={audioState === "playing" ? "إيقاف مؤقت" : audioState === "paused" ? "متابعة" : "استمع"}
        >
          {audioState === "loading" ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--color-accent)" }} />
          ) : audioState === "playing" ? (
            <VoiceWaveIcon size={16} />
          ) : audioState === "paused" ? (
            <Play size={16} style={{ color: "var(--color-accent)" }} />
          ) : (
            <Play size={16} style={{ color: "#999" }} />
          )}
        </button>

        <span className="w-px h-4 mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          disabled={submittingFeedback}
          className={iconBtnClass}
          title="مفيد"
          aria-label="مفيد"
        >
          <ThumbsUp
            size={16}
            style={{ color: iconColor(liked === "up", "#2E8B57") }}
            fill={liked === "up" ? "#2E8B57" : "none"}
          />
        </button>

        {/* Dislike */}
        <button
          type="button"
          onClick={handleDislike}
          disabled={submittingFeedback}
          className={iconBtnClass}
          title="غير مفيد"
          aria-label="غير مفيد"
        >
          <ThumbsDown
            size={16}
            style={{ color: iconColor(liked === "down", "#D14D72") }}
            fill={liked === "down" ? "#D14D72" : "none"}
          />
        </button>

        <span className="w-px h-4 mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

        {/* Regenerate */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating || !onRegenerate}
          className={iconBtnClass}
          title="إعادة توليد"
          aria-label="إعادة توليد"
        >
          <RefreshCw
            size={16}
            style={{ color: "#999" }}
            className={regenerating ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Dislike reason dropdown */}
      {showDislikeForm && (
        <div
          className="mt-2 flex items-center gap-2 px-1 font-ui"
          style={{ animation: "message-slide-in 0.2s ease-out" }}
        >
          <select
            value={dislikeReason}
            onChange={(e) => setDislikeReason(e.target.value as FeedbackReason)}
            className="px-3 py-1.5 rounded-lg text-xs border"
            style={{
              background: "#fafafa",
              borderColor: "rgba(0,0,0,0.1)",
              color: "#231f20",
            }}
          >
            {FEEDBACK_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submitDislike}
            disabled={submittingFeedback}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
          >
            {submittingFeedback ? "..." : "إرسال"}
          </button>
          <button
            type="button"
            onClick={() => setShowDislikeForm(false)}
            className="p-1 rounded hover:bg-black/5"
            aria-label="إغلاق"
          >
            <X size={14} style={{ color: "#999" }} />
          </button>
        </div>
      )}
    </div>
  );
}

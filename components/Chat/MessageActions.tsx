"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Copy,
  Check,
  ThumbsDown,
  ThumbsUp,
  RefreshCw,
  Loader2,
  X,
  Sparkles,
  FileText,
} from "lucide-react";

interface MessageActionsProps {
  messageId: string;
  content: string;
  speechSpeed?: number;
  voiceId?: string;
  onRegenerate?: () => void;
  onEnhance?: (content: string) => void;
  onWriteReport?: (content: string) => void;
}

type FeedbackReason = "inaccurate" | "not_helpful" | "too_long" | "other";

const FEEDBACK_REASONS: { value: FeedbackReason; label: string }[] = [
  { value: "inaccurate", label: "غير دقيق" },
  { value: "not_helpful", label: "غير مفيد" },
  { value: "too_long", label: "طويل جداً" },
  { value: "other", label: "سبب آخر" },
];

export function MessageActions({
  messageId,
  content,
  onRegenerate,
  onEnhance,
  onWriteReport,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [showDislikeForm, setShowDislikeForm] = useState(false);
  const [dislikeReason, setDislikeReason] = useState<FeedbackReason>("inaccurate");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
        // Silently fail
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
    active ? activeColor : "var(--text-tertiary)";

  return (
    <div className="mt-1">
      <div className="flex items-center gap-0.5 message-actions-bar">
        {/* 1. Copy */}
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
              <Copy size={16} style={{ color: "var(--text-tertiary)" }} />
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

        {/* 2. Regenerate */}
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
            style={{ color: "var(--text-tertiary)" }}
            className={regenerating ? "animate-spin" : ""}
          />
        </button>

        {/* 3. Like */}
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

        {/* 4. Dislike */}
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

        <span className="action-separator w-px h-4 mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

        {/* 5. زد (Enhance) */}
        <button
          type="button"
          onClick={() => onEnhance?.(content)}
          disabled={!onEnhance}
          className={iconBtnClass}
          title="زد — وسّع الإجابة"
          aria-label="زد — وسّع الإجابة"
        >
          <Sparkles size={16} style={{ color: "var(--text-tertiary)" }} />
        </button>

        {/* 6. Write Report */}
        <button
          type="button"
          onClick={() => onWriteReport?.(content)}
          disabled={!onWriteReport}
          className={iconBtnClass}
          title="اكتب تقرير"
          aria-label="اكتب تقرير"
        >
          <FileText size={16} style={{ color: "var(--text-tertiary)" }} />
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
              background: "var(--bg-input)",
              borderColor: "rgba(0,0,0,0.1)",
              color: "var(--text-primary)",
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
            <X size={14} style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>
      )}
    </div>
  );
}

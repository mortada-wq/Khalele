"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { addPoints, checkAndUnlockBadges } from "@/components/Gamification/UserPoints";
import { CONTRIBUTION_POINTS } from "@/lib/gamification";

type CorrectionType = "dialect_authenticity" | "grammar" | "cultural_context" | "factual";

const CORRECTION_TO_POINTS: Record<CorrectionType, keyof typeof CONTRIBUTION_POINTS> = {
  dialect_authenticity: "dialect_improvement",
  grammar: "dialect_improvement",
  cultural_context: "cultural_insight",
  factual: "fact_correction",
};

interface FeedbackButtonsProps {
  messageId: string;
  originalResponse: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
}

export function FeedbackButtons({
  messageId,
  originalResponse,
  onThumbsUp,
  onThumbsDown,
}: FeedbackButtonsProps) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctedText, setCorrectedText] = useState("");
  const [correctionType, setCorrectionType] = useState<CorrectionType>("dialect_authenticity");
  const [submitted, setSubmitted] = useState(false);

  const submitCorrection = async () => {
    if (!correctedText.trim()) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalResponse,
          correctedResponse: correctedText,
          correctionType,
        }),
      });
      const pointsType = CORRECTION_TO_POINTS[correctionType];
      addPoints(pointsType);
      checkAndUnlockBadges(pointsType);
      setSubmitted(true);
      setShowCorrection(false);
      onThumbsDown?.();
    } catch {
      // ignore
    }
  };

  if (submitted) return null;

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={onThumbsUp}
        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-green-400 transition-colors"
        title="جيد"
      >
        <ThumbsUp size={18} />
      </button>
      <button
        onClick={() => setShowCorrection(!showCorrection)}
        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-amber-400 transition-colors"
        title="تحسين"
      >
        <ThumbsDown size={18} />
      </button>

      {showCorrection && (
        <div className="flex-1 flex flex-col gap-2">
          <select
            value={correctionType}
            onChange={(e) => setCorrectionType(e.target.value as CorrectionType)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90"
          >
            <option value="dialect_authenticity">لهجة</option>
            <option value="grammar">قواعد</option>
            <option value="cultural_context">سياق ثقافي</option>
            <option value="factual">معلومة خاطئة</option>
          </select>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              placeholder="اكتب التصحيح..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
            />
            <button
              onClick={submitCorrection}
              className="px-3 py-2 bg-khalele-gold/80 text-black rounded-lg text-sm font-medium hover:bg-khalele-gold"
            >
              إرسال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

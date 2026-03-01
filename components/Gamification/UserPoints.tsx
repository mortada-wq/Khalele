"use client";

import { useState, useEffect } from "react";
import { Award, Star } from "lucide-react";
import { BADGES, checkAndUnlockBadges } from "@/lib/gamification";

export { checkAndUnlockBadges };

const STORAGE_KEY = "khalele_user_points";
const BADGES_KEY = "khalele_user_badges";

export function UserPoints() {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  const refresh = () => {
    const p = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    const b = JSON.parse(localStorage.getItem(BADGES_KEY) ?? "[]");
    setPoints(p);
    setBadges(b);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("khalele-points-update", refresh);
    return () => window.removeEventListener("khalele-points-update", refresh);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-kheleel-gold/15 border border-kheleel-gold/30">
        <Star size={16} className="text-kheleel-gold" />
        <span className="text-sm font-medium text-kheleel-gold">{points}</span>
      </div>
      {badges.length > 0 && (
        <div className="flex items-center gap-1">
          <Award size={16} className="text-kheleel-gold" />
          {badges.slice(0, 2).map((id) => (
            <span key={id} className="text-xs text-white/70">
              {BADGES.find((b) => b.id === id)?.name ?? id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function addPoints(type: "fact_correction" | "cultural_insight" | "dialect_improvement" | "character_development", amount?: number) {
  const pts = amount ?? 20;
  const current = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
  localStorage.setItem(STORAGE_KEY, String(current + pts));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("khalele-points-update"));
}

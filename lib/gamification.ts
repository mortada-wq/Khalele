export const CONTRIBUTION_POINTS = {
  fact_correction: 10,
  cultural_insight: 15,
  dialect_improvement: 20,
  character_development: 25,
} as const;

export const BADGES = [
  { id: "cultural_expert", name: "خبير ثقافي", nameEn: "Cultural Expert", requirement: { type: "cultural_insight" as const, count: 3 } },
  { id: "language_master", name: "سيد اللغة", nameEn: "Language Master", requirement: { type: "dialect_improvement" as const, count: 3 } },
  { id: "fact_checker", name: "مدقق الحقائق", nameEn: "Fact Checker", requirement: { type: "fact_correction" as const, count: 3 } },
  { id: "character_creator", name: "صانع الشخصيات", nameEn: "Character Creator", requirement: { type: "character_development" as const, count: 2 } },
] as const;

export function getPointsForType(type: keyof typeof CONTRIBUTION_POINTS): number {
  return CONTRIBUTION_POINTS[type] ?? 0;
}

const COUNTS_KEY = "kheleel_contribution_counts";

export function getContributionCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem(COUNTS_KEY) ?? "{}");
}

function incrementCount(type: string): number {
  const counts = getContributionCounts();
  counts[type] = (counts[type] ?? 0) + 1;
  if (typeof window !== "undefined") {
    localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  }
  return counts[type];
}

export function checkAndUnlockBadges(
  type: "fact_correction" | "cultural_insight" | "dialect_improvement" | "character_development"
): string[] {
  const newBadges: string[] = [];
  incrementCount(type);
  const counts = getContributionCounts();
  const current = JSON.parse(
    typeof window !== "undefined" ? localStorage.getItem("kheleel_user_badges") ?? "[]" : "[]"
  ) as string[];

  for (const badge of BADGES) {
    if (current.includes(badge.id)) continue;
    const req = badge.requirement;
    if (req.type !== type) continue;
    const c = counts[req.type] ?? 0;
    if (c >= req.count) {
      newBadges.push(badge.id);
      current.push(badge.id);
    }
  }

  if (newBadges.length > 0 && typeof window !== "undefined") {
    localStorage.setItem("kheleel_user_badges", JSON.stringify(current));
    window.dispatchEvent(new Event("kheleel-points-update"));
  }
  return newBadges;
}

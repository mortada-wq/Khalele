export interface BehaviorSnapshot {
  totalMessages: number;
  avgCharsPerMessage: number;
  questionRatio: number;
  lateNightRatio: number;
}

export interface NicknameSuggestionPayload {
  value: string;
  tone: string;
}

export const NICKNAME_DELAY_HOURS = 3;
export const MAX_NICKNAME_LENGTH = 40;
export const MAX_REASON_LENGTH = 180;

const POOLS = {
  curious: [
    "المحقق اللطيف",
    "كابتن ليه",
    "صائد التفاصيل",
    "سؤال على السريع",
  ],
  storyteller: [
    "الراوي الكبير",
    "كبير الخواطر",
    "كاتب الملحمة",
    "مُطوّل بنكهة",
  ],
  night: [
    "ملك السهارى",
    "حارس منتصف الليل",
    "خفاش الإنجاز",
    "كابتن السهر",
  ],
  heavy: [
    "صديق خليل الدائم",
    "المعسكر معنا",
    "لاعب أساسي",
    "دائم الحضور",
  ],
  balanced: [
    "مزبوطها",
    "سيد التوازن",
    "النسخة المنعّمة",
    "مهندس المزاج",
  ],
} as const;

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function asFinite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeBehaviorSnapshot(input: unknown): BehaviorSnapshot {
  const raw = (input ?? {}) as Partial<BehaviorSnapshot>;
  const totalMessages = clamp(Math.round(asFinite(raw.totalMessages) ?? 0), 0, 100000);
  const avgCharsPerMessage = clamp(Math.round(asFinite(raw.avgCharsPerMessage) ?? 0), 0, 2000);
  const questionRatio = clamp(asFinite(raw.questionRatio) ?? 0, 0, 1);
  const lateNightRatio = clamp(asFinite(raw.lateNightRatio) ?? 0, 0, 1);

  return {
    totalMessages,
    avgCharsPerMessage,
    questionRatio,
    lateNightRatio,
  };
}

export function hoursUntilNicknameReady(createdAt: string, now: Date = new Date()): number {
  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return NICKNAME_DELAY_HOURS;
  const elapsedHours = (now.getTime() - createdMs) / (1000 * 60 * 60);
  return Math.max(0, Number((NICKNAME_DELAY_HOURS - elapsedHours).toFixed(1)));
}

function hashSeed(snapshot: BehaviorSnapshot): number {
  const composite =
    snapshot.totalMessages * 17 +
    snapshot.avgCharsPerMessage * 13 +
    Math.round(snapshot.questionRatio * 100) * 11 +
    Math.round(snapshot.lateNightRatio * 100) * 7;
  return Math.abs(composite);
}

function pickPool(snapshot: BehaviorSnapshot): keyof typeof POOLS {
  if (snapshot.questionRatio >= 0.35) return "curious";
  if (snapshot.avgCharsPerMessage >= 120) return "storyteller";
  if (snapshot.lateNightRatio >= 0.3) return "night";
  if (snapshot.totalMessages >= 40) return "heavy";
  return "balanced";
}

export function buildNicknameSuggestion(
  snapshotInput: unknown,
  rejected: string[] = []
): NicknameSuggestionPayload {
  const snapshot = normalizeBehaviorSnapshot(snapshotInput);
  const poolName = pickPool(snapshot);
  const pool = POOLS[poolName];
  const rejectedSet = new Set(rejected.map((item) => item.trim()).filter(Boolean));
  const preferred = pool.filter((name) => !rejectedSet.has(name));
  const candidates = preferred.length > 0 ? preferred : pool;
  const seed = hashSeed(snapshot);
  const value = candidates[seed % candidates.length];

  const tone =
    poolName === "curious"
      ? "واضح إنك تحب الأسئلة السريعة والذكية."
      : poolName === "storyteller"
        ? "أسلوبك مفصل ومليان حكاية."
        : poolName === "night"
          ? "نشاطك الليلي ظاهر يا صاحب السهر."
          : poolName === "heavy"
            ? "واضح إنك من جمهور خليل الثقيل."
            : "مزاجك متوازن ومرتب.";

  return { value, tone };
}

export function normalizeReason(reason: unknown): string {
  if (typeof reason !== "string") return "";
  return reason.trim().slice(0, MAX_REASON_LENGTH);
}


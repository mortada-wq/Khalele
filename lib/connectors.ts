/**
 * Detect integration intent from user message for contextual prompts.
 * When user tries to use a feature without connected app, we suggest connecting.
 */

const DRIVE_KEYWORDS = [
  "ملف",
  "مستند",
  "عرض",
  "عرض تقديمي",
  "راجع",
  "حلل",
  "لخّص",
  "لخص",
  "استخرج",
  "وثيقة",
  "وثائق",
  "pdf",
  "word",
  "excel",
];

const GMAIL_KEYWORDS = [
  "بريد",
  "رسالة",
  "إيميل",
  "ايميل",
  "ردد",
  "رد",
  "تلخيص",
  "تلخيص الرسائل",
  "رسائلي",
];

const CALENDAR_KEYWORDS = [
  "موعد",
  "جدولة",
  "اجتماع",
  "تقويم",
  "التقويم",
  "جدول",
  "تعارض",
];

export type IntegrationSuggestion = "drive" | "gmail" | "calendar" | null;

export function detectIntegrationIntent(message: string): IntegrationSuggestion {
  const lower = message.toLowerCase().trim();
  const normalized = lower.replace(/\s+/g, " ");

  for (const kw of DRIVE_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return "drive";
  }
  for (const kw of GMAIL_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return "gmail";
  }
  for (const kw of CALENDAR_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return "calendar";
  }
  return null;
}

export const INTEGRATION_PROMPTS: Record<Exclude<IntegrationSuggestion, null>, string> = {
  drive: "ربط Google Drive للوصول إلى مستنداتك",
  gmail: "ربط Gmail للوصول إلى رسائلك",
  calendar: "ربط Google Calendar للجدولة الذكية",
};

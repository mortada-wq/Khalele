/**
 * Admin-defined tools. Users add these to their sidebar under أدوات.
 * Free marketplace — each user gets up to MAX_USER_TOOLS slots.
 */

export const MAX_USER_TOOLS = 3;

export interface Tool {
  id: string;
  label: string;
  definition: string;
  icon: string;
  color: string;
}

export const ADMIN_TOOLS: Tool[] = [
  {
    id: "notebook",
    label: "دفتر",
    definition: "دفتر ملاحظاتك وأفكارك — اكتب، احفظ، وارجع إليها مع خليل",
    icon: "edit_note",
    color: "#E8A838",
  },
  {
    id: "music",
    label: "موسيقى خليل",
    definition: "اكتشف موسيقى، اطلب أغاني، واحصل على توصيات موسيقية",
    icon: "music_note",
    color: "#D14D72",
  },
  {
    id: "images",
    label: "تصاوير",
    definition: "توليد صور بالذكاء الاصطناعي — صف ما تريد، خليل يرسمه",
    icon: "palette",
    color: "#7B5EA7",
  },
  {
    id: "translator",
    label: "ترجمان",
    definition: "ترجمة فورية بين العربية واللغات الأخرى — نص أو صوت",
    icon: "translate",
    color: "#3A86A8",
  },
  {
    id: "teach_language",
    label: "علمني لغة",
    definition: "تعلم لغة جديدة مع خليل — دروس، تمارين، ومحادثة",
    icon: "school",
    color: "#2E8B57",
  },
  {
    id: "news_tailor",
    label: "خياط الأخبار",
    definition: "أخبار مخصصة لك — اختر مواضيعك، خليل يلخص لك",
    icon: "newspaper",
    color: "#5A7D9A",
  },
  {
    id: "pillow_broadcast",
    label: "اذاعة المخدة",
    definition: "قصص، بودكاست، ومحتوى هادئ قبل النوم",
    icon: "bedtime",
    color: "#6C5B7B",
  },
];

export const USER_TOOLS_KEY = "khalele_user_tools";

export function getUserTools(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_TOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addUserTool(toolId: string): boolean {
  const current = getUserTools();
  if (current.includes(toolId)) return false;
  if (current.length >= MAX_USER_TOOLS) return false;
  localStorage.setItem(USER_TOOLS_KEY, JSON.stringify([...current, toolId]));
  return true;
}

export function removeUserTool(toolId: string): void {
  const current = getUserTools().filter((id) => id !== toolId);
  localStorage.setItem(USER_TOOLS_KEY, JSON.stringify(current));
}

export function canAddMoreTools(): boolean {
  return getUserTools().length < MAX_USER_TOOLS;
}

export function toolSlotsUsed(): number {
  return getUserTools().length;
}

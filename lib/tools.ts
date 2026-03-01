/**
 * Admin-defined tools. Users add these to their sidebar under أدوات.
 */

export interface Tool {
  id: string;
  label: string;
  definition: string;
}

export const ADMIN_TOOLS: Tool[] = [
  {
    id: "notebook",
    label: "دفتر",
    definition: "دفتر ملاحظاتك وأفكارك — اكتب، احفظ، وارجع إليها مع خليل",
  },
  {
    id: "music",
    label: "موسيقى خليل",
    definition: "اكتشف موسيقى، اطلب أغاني، واحصل على توصيات موسيقية",
  },
  {
    id: "images",
    label: "تصاوير",
    definition: "توليد صور بالذكاء الاصطناعي — صف ما تريد، خليل يرسمه",
  },
  {
    id: "translator",
    label: "ترجمان",
    definition: "ترجمة فورية بين العربية واللغات الأخرى — نص أو صوت",
  },
  {
    id: "teach_language",
    label: "علمني لغة",
    definition: "تعلم لغة جديدة مع خليل — دروس، تمارين، ومحادثة",
  },
  {
    id: "news_tailor",
    label: "خياط الأخبار",
    definition: "أخبار مخصصة لك — اختر مواضيعك، خليل يلخص لك",
  },
  {
    id: "pillow_broadcast",
    label: "اذاعة المخدة",
    definition: "قصص، بودكاست، ومحتوى هادئ قبل النوم",
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

export function addUserTool(toolId: string): void {
  const current = getUserTools();
  if (current.includes(toolId)) return;
  localStorage.setItem(USER_TOOLS_KEY, JSON.stringify([...current, toolId]));
}

export function removeUserTool(toolId: string): void {
  const current = getUserTools().filter((id) => id !== toolId);
  localStorage.setItem(USER_TOOLS_KEY, JSON.stringify(current));
}

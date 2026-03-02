import type { LanguageCode } from "@aws-sdk/client-polly";

export interface VoiceOption {
  id: string;
  nameAr: string;
  nameEn: string;
  gender: "female" | "male";
  engine: "standard" | "neural";
  languageCode: LanguageCode;
  preview: string;
}

export const ARABIC_VOICES: VoiceOption[] = [
  {
    id: "Zeina",
    nameAr: "زينة",
    nameEn: "Zeina",
    gender: "female",
    engine: "standard",
    languageCode: "arb",
    preview: "مرحباً، أنا زينة. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "Hala",
    nameAr: "هالة",
    nameEn: "Hala",
    gender: "female",
    engine: "neural",
    languageCode: "ar-AE",
    preview: "مرحباً، أنا هالة. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "Zayd",
    nameAr: "زيد",
    nameEn: "Zayd",
    gender: "male",
    engine: "neural",
    languageCode: "ar-AE",
    preview: "مرحباً، أنا زيد. كيف يمكنني مساعدتك اليوم؟",
  },
];

export const VOICE_MAP = Object.fromEntries(
  ARABIC_VOICES.map((v) => [v.id, v])
) as Record<string, VoiceOption>;

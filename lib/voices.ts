export interface VoiceOption {
  id: string;
  nameAr: string;
  nameEn: string;
  gender: "female" | "male";
  engine: "standard" | "wavenet" | "neural2" | "chirp";
  languageCode: string;
  preview: string;
}

export const ARABIC_VOICES: VoiceOption[] = [
  {
    id: "ar-XA-Wavenet-A",
    nameAr: "نورا",
    nameEn: "Noura",
    gender: "female",
    engine: "wavenet",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا نورا. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "ar-XA-Wavenet-B",
    nameAr: "عمر",
    nameEn: "Omar",
    gender: "male",
    engine: "wavenet",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا عمر. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "ar-XA-Wavenet-C",
    nameAr: "يوسف",
    nameEn: "Yousef",
    gender: "male",
    engine: "wavenet",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا يوسف. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "ar-XA-Wavenet-D",
    nameAr: "ليلى",
    nameEn: "Layla",
    gender: "female",
    engine: "wavenet",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا ليلى. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "ar-XA-Standard-A",
    nameAr: "سارة",
    nameEn: "Sara",
    gender: "female",
    engine: "standard",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا سارة. كيف يمكنني مساعدتك اليوم؟",
  },
  {
    id: "ar-XA-Standard-B",
    nameAr: "خالد",
    nameEn: "Khaled",
    gender: "male",
    engine: "standard",
    languageCode: "ar-XA",
    preview: "مرحباً، أنا خالد. كيف يمكنني مساعدتك اليوم؟",
  },
];

export const VOICE_MAP = Object.fromEntries(
  ARABIC_VOICES.map((v) => [v.id, v])
) as Record<string, VoiceOption>;

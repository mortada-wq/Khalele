export type LanguageStyle = "formal_msa" | "easy_arabic";

export interface Character {
  id: string;
  name: string;
  nameAr: string;
  region: "baghdad" | "basra" | "mosul";
  languageStyle: LanguageStyle;
  description: string;
}

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: "khalele-base",
    name: "Khalele",
    nameAr: "خليلي",
    region: "baghdad",
    languageStyle: "easy_arabic",
    description: "الذكاء الاصطناعي العربي الافتراضي — يفهم كل اللهجات، يرد بالفصحى أو العربية السهلة",
  },
  {
    id: "baghdadi-teacher",
    name: "Ahmed (Teacher)",
    nameAr: "أحمد المعلم",
    region: "baghdad",
    languageStyle: "formal_msa",
    description: "معلم — يرد بالفصحى الرسمية",
  },
  {
    id: "basrawi-trader",
    name: "Hassan (Trader)",
    nameAr: "حسن البصري",
    region: "basra",
    languageStyle: "easy_arabic",
    description: "تاجر — يرد بالعربية السهلة",
  },
  {
    id: "mosuli-elder",
    name: "Grandfather",
    nameAr: "الجدي",
    region: "mosul",
    languageStyle: "formal_msa",
    description: "جد — يرد بالفصحى الرسمية",
  },
];

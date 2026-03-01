"use client";

import type { LanguageStyle } from "@/lib/characters";

const STYLES: { value: LanguageStyle; label: string }[] = [
  { value: "formal_msa", label: "فصحى رسمية" },
  { value: "easy_arabic", label: "عربية سهلة" },
];

interface LanguageStyleSelectorProps {
  value: LanguageStyle;
  onChange: (v: LanguageStyle) => void;
}

export function LanguageStyleSelector({ value, onChange }: LanguageStyleSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LanguageStyle)}
      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
    >
      {STYLES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

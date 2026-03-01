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
      className="font-ui px-3 py-1.5 rounded-lg text-sm"
      style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#231f20" }}
    >
      {STYLES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

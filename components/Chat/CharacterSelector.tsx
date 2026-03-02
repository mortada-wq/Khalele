"use client";

import { DEFAULT_CHARACTERS } from "@/lib/characters";
import type { Character } from "@/lib/characters";

interface CharacterSelectorProps {
  selected: Character;
  onSelect: (c: Character) => void;
}

export function CharacterSelector({ selected, onSelect }: CharacterSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {DEFAULT_CHARACTERS.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="px-4 py-2 rounded-xl whitespace-nowrap transition-colors border font-ui text-sm"
          aria-label={c.nameAr}
          style={{
            background: selected.id === c.id ? "var(--color-accent-tint-12)" : "#ffffff",
            color: selected.id === c.id ? "var(--color-accent)" : "#5a5a5a",
            borderColor: selected.id === c.id ? "var(--color-accent-tint-25)" : "#e5e5e5",
          }}
        >
          <span className="font-medium">{c.nameAr}</span>
        </button>
      ))}
    </div>
  );
}

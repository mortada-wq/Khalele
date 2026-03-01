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
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            selected.id === c.id
              ? "bg-kheleel-gold text-black"
              : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
          }`}
        >
          <span className="font-medium">{c.nameAr}</span>
        </button>
      ))}
    </div>
  );
}

import { LanguageStyleSelector } from "./LanguageStyleSelector";
import type { LanguageStyle } from "@/lib/characters";

interface ControlsBarProps {
  languageStyle: LanguageStyle;
  onLanguageStyleChange: (style: LanguageStyle) => void;
  useSearch: boolean;
  onUseSearchChange: (value: boolean) => void;
  empathyMode: boolean;
  onEmpathyModeChange: (value: boolean) => void;
  ramadanMode: boolean;
  onRamadanModeChange: (value: boolean) => void;
}

export function ControlsBar({
  languageStyle,
  onLanguageStyleChange,
  useSearch,
  onUseSearchChange,
  empathyMode,
  onEmpathyModeChange,
  ramadanMode,
  onRamadanModeChange,
}: ControlsBarProps) {
  return (
    <div className="shrink-0 px-4 md:px-6 pt-2">
      <div className="max-w-2xl mx-auto flex items-center gap-3 md:gap-4 flex-wrap pb-2">
        <LanguageStyleSelector value={languageStyle} onChange={onLanguageStyleChange} />
        {[
          { label: "بحث", key: "useSearch", val: useSearch, set: onUseSearchChange },
          { label: "تعاطف", key: "empathy", val: empathyMode, set: onEmpathyModeChange },
          { label: "رمضان", key: "ramadan", val: ramadanMode, set: onRamadanModeChange },
        ].map(({ label, key, val, set }) => (
          <label
            key={key}
            className="flex items-center gap-1.5 cursor-pointer font-ui text-xs md:text-sm select-none"
            style={{ color: "#5a5a5a" }}
          >
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => set(e.target.checked)}
              className="rounded accent-accent"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

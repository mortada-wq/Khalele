/**
 * User accent color palette. One color drives the whole UI.
 * Stored in localStorage. Reset restores default.
 */

export const DEFAULT_ACCENT = "#C68E17";
const STORAGE_KEY = "khalele_accent_color";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 198, g: 142, b: 23 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${Math.max(0, Math.floor(r * (1 - amount)))
    .toString(16)
    .padStart(2, "0")}${Math.max(0, Math.floor(g * (1 - amount)))
    .toString(16)
    .padStart(2, "0")}${Math.max(0, Math.floor(b * (1 - amount)))
    .toString(16)
    .padStart(2, "0")}`;
}

export function derivePalette(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const hover = darken(hex, 0.15);
  const avatarExpanded = darken(hex, 0.25);
  const avatarCollapsed = darken(hex, 0.4);
  const earth = darken(hex, 0.45);
  return {
    accent: hex,
    hover,
    avatarExpanded,
    avatarCollapsed,
    earth,
    tint12: `rgba(${r}, ${g}, ${b}, 0.12)`,
    tint08: `rgba(${r}, ${g}, ${b}, 0.08)`,
    tint20: `rgba(${r}, ${g}, ${b}, 0.2)`,
    tint25: `rgba(${r}, ${g}, ${b}, 0.25)`,
    tint10: `rgba(${r}, ${g}, ${b}, 0.1)`,
    tint06: `rgba(${r}, ${g}, ${b}, 0.06)`,
    tint40: `rgba(${r}, ${g}, ${b}, 0.4)`,
  };
}

const VAR_NAMES = [
  "color-accent",
  "color-accent-hover",
  "color-accent-avatar-expanded",
  "color-accent-avatar-collapsed",
  "color-earth",
  "color-accent-tint-12",
  "color-accent-tint-08",
  "color-accent-tint-20",
  "color-accent-tint-25",
  "color-accent-tint-10",
  "color-accent-tint-06",
  "color-accent-tint-40",
] as const;

function setVars(palette: ReturnType<typeof derivePalette>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--color-accent", palette.accent);
  root.style.setProperty("--color-accent-hover", palette.hover);
  root.style.setProperty("--color-accent-avatar-expanded", palette.avatarExpanded);
  root.style.setProperty("--color-accent-avatar-collapsed", palette.avatarCollapsed);
  root.style.setProperty("--color-earth", palette.earth);
  root.style.setProperty("--color-accent-tint-12", palette.tint12);
  root.style.setProperty("--color-accent-tint-08", palette.tint08);
  root.style.setProperty("--color-accent-tint-20", palette.tint20);
  root.style.setProperty("--color-accent-tint-25", palette.tint25);
  root.style.setProperty("--color-accent-tint-10", palette.tint10);
  root.style.setProperty("--color-accent-tint-06", palette.tint06);
  root.style.setProperty("--color-accent-tint-40", palette.tint40);
}

function clearVars() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  VAR_NAMES.forEach((name) => root.style.removeProperty(`--${name}`));
}

export function applyPalette(hex: string) {
  setVars(derivePalette(hex));
}

export function resetPalette() {
  clearVars();
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

export function savePalette(hex: string) {
  applyPalette(hex);
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, hex);
}

export function loadPalette(): string | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    applyPalette(stored);
    return stored;
  }
  return null;
}

export function getStoredAccent(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

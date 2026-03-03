"use client";

import { useTheme } from "@/components/ThemeProvider";
import { SunIcon } from "@/components/Icons/SunIcon";
import { MoonIcon } from "@/components/Icons/MoonIcon";

/**
 * Day/Night theme toggle.
 * Sun icon when dark (click → switch to light).
 * Moon icon when light (click → switch to dark).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle-btn"
    >
      {theme === "dark" ? (
        <SunIcon size={20} />
      ) : (
        <MoonIcon size={20} />
      )}
    </button>
  );
}

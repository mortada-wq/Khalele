"use client";

import { useEffect, useState } from "react";
import { KheleelLogoMark } from "./Icons/KheleelLogo";

function ThemeToggleIcon({ isDark }: { isDark: boolean }) {
  return isDark ? (
    // Kheleel Logo - Light Theme
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <KheleelLogoMark />
    </div>
  ) : (
    // Moon icon - Dark Theme
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export interface TopBarProps {
  userRole?: "admin" | "user";
  showChatActions?: boolean;
  onShare?: () => void;
  onReport?: () => void;
}

export function TopBar({
  userRole,
}: TopBarProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check current theme
    const theme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("kheleel_theme") || "dark";
    setIsDark(theme === "dark");
  }, []);

  const handleThemeToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("kheleel_theme", newTheme);
  };

  return (
    <div
      className="top-bar shrink-0 flex items-center justify-end px-4 md:px-6"
      style={{ height: 52, background: "transparent", gap: "12px" }}
    >
      <button
        type="button"
        onClick={handleThemeToggle}
        className="theme-toggle-btn shrink-0"
        aria-label={isDark ? "تبديل للوضع الفاتح" : "تبديل للوضع الداكن"}
        title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
        style={{
          color: "var(--text-tertiary)",
          transition: "color 0.2s ease",
        }}
      >
        <ThemeToggleIcon isDark={isDark} />
      </button>
    </div>
  );
}

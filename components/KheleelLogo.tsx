"use client";

import { useEffect, useState } from "react";
import { KheleelLogoMark } from "./Icons/KheleelLogo";
import { BlackKheleelLogo } from "./Icons/BlackKheleelLogo";

export interface KheleelLogoProps {
  className?: string;
  alt?: string;
}

export function KheleelLogo({ className = "", alt = "خليل" }: KheleelLogoProps) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check current theme
    const theme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("kheleel_theme") || "dark";
    setIsDark(theme === "dark");

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme") || "dark";
      setIsDark(newTheme === "dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Placeholder */}
      </div>
    );
  }

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {isDark ? <KheleelLogoMark /> : <BlackKheleelLogo />}
    </div>
  );
}

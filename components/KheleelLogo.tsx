"use client";

import { useTheme } from "@/components/ThemeProvider";

const LOGO_LIGHT = "/logo/logo_black.png";
const LOGO_DARK = "/logo/logo_white.png";

export interface KheleelLogoProps {
  className?: string;
  alt?: string;
}

export function KheleelLogo({ className = "", alt = "خليلي" }: KheleelLogoProps) {
  const { theme } = useTheme();
  const src = theme === "dark" ? LOGO_DARK : LOGO_LIGHT;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}

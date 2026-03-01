"use client";

import { useEffect } from "react";
import { loadPalette } from "@/lib/theme-color";

/**
 * Applies user's accent color from localStorage on mount.
 * Runs before paint to minimize flash.
 */
export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadPalette();
  }, []);
  return <>{children}</>;
}

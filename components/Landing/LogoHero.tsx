"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function LogoHero() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <main
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-black" : "bg-white"
      }`}
      dir="ltr"
    >
      <Image
        src={isDark ? "/logo-dark.png" : "/logo-light.png"}
        alt="Kheleel Brand Logo"
        width={220}
        height={220}
        priority
        className={`h-auto w-[220px] md:w-[280px] transition-all duration-300 ${
          isDark
            ? "[filter:drop-shadow(0_0_20px_rgba(255,255,255,0.05))]"
            : "[filter:drop-shadow(0_0_20px_rgba(0,0,0,0.08))]"
        }`}
      />
    </main>
  );
}

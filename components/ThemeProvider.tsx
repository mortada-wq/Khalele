"use client";

import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext<{ theme: "dark"; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

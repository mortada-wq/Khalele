import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: "var(--color-accent)",
        earth: "var(--color-earth)",
        "kheleel-gold": "var(--color-accent)",
      },
      fontFamily: {
        title: ["var(--font-title)", "serif"],
        body: ["var(--font-body)", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        poetry: ["var(--font-poetry)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

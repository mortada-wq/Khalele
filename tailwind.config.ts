import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: "#C68E17",
        earth: "#8B7355",
        "khalele-gold": "#C68E17",
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

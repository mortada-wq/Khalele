import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kheleel | خليلي — ذكاء اصطناعي عربي",
    short_name: "خليلي",
    description: "ذكاء اصطناعي يتكلم عربي — يفهم كل اللهجات العربية",
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    theme_color: "#C68E17",
    background_color: "#0e0e0e",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
  };
}

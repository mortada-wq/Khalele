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
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}

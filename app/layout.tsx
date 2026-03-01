import type { Metadata } from "next";
import { Aref_Ruqaa, Amiri, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeColorProvider } from "@/components/ThemeColorProvider";
import "react-material-symbols/outlined";
import "./globals.css";

/* Design Bible Rule 2: Only these 4 Arabic fonts */
const arefRuqaa = Aref_Ruqaa({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-title",
  display: "swap",
});
const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-body",
  display: "swap",
});
const notoNaskh = Noto_Naskh_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ui",
  display: "swap",
});
const notoNastaliq = Noto_Nastaliq_Urdu({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-poetry",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khalele | خليلي - Arabic AI",
  description:
    "Arabic AI for all Arab countries. Understands every dialect, responds in Fusha or Easy Arabic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${arefRuqaa.variable} ${amiri.variable} ${notoNaskh.variable} ${notoNastaliq.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);var s=localStorage.getItem("khalele_accent_color");if(s){var h=s.replace(/^#/,""),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),d=function(a){return"#"+[r,g,b].map(function(c){return Math.max(0,Math.floor(c*(1-a))).toString(16).padStart(2,"0")}).join("")},root=document.documentElement;root.style.setProperty("--color-accent",s);root.style.setProperty("--color-accent-hover",d(0.15));root.style.setProperty("--color-accent-avatar-expanded",d(0.25));root.style.setProperty("--color-accent-avatar-collapsed",d(0.4));root.style.setProperty("--color-earth",d(0.45));root.style.setProperty("--color-accent-tint-12","rgba("+r+","+g+","+b+",0.12)");root.style.setProperty("--color-accent-tint-08","rgba("+r+","+g+","+b+",0.08)");root.style.setProperty("--color-accent-tint-20","rgba("+r+","+g+","+b+",0.2)");root.style.setProperty("--color-accent-tint-25","rgba("+r+","+g+","+b+",0.25)");root.style.setProperty("--color-accent-tint-10","rgba("+r+","+g+","+b+",0.1)");root.style.setProperty("--color-accent-tint-06","rgba("+r+","+g+","+b+",0.06)");root.style.setProperty("--color-accent-tint-40","rgba("+r+","+g+","+b+",0.4)");}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <ThemeColorProvider>{children}</ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

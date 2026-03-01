import type { Metadata } from "next";
import Script from "next/script";
import { Aref_Ruqaa, Amiri, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
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
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);})();`,
        }}
      />
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

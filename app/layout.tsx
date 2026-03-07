import type { Metadata } from "next";
import { Aref_Ruqaa, Amiri, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeColorProvider } from "@/components/ThemeColorProvider";
import { AuthProvider } from "@/components/AuthProvider";
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
  metadataBase: new URL("https://kheleel.com"),
  title: {
    default: "Kheleel | خليلي — ذكاء اصطناعي عربي",
    template: "%s | Kheleel خليلي",
  },
  description:
    "ذكاء اصطناعي يتكلم عربي — يفهم كل اللهجات: عراقي، مصري، خليجي، شامي، مغربي. محادثة صوتية، أدوات، وخصوصية كاملة. مجاني.",
  keywords: [
    "ذكاء اصطناعي عربي",
    "Arabic AI",
    "chatbot عربي",
    "خليلي",
    "Kheleel",
    "لهجات عربية",
    "محادثة ذكاء اصطناعي",
    "AI بالعربي",
  ],
  authors: [{ name: "Kheleel", url: "https://kheleel.com" }],
  creator: "Kheleel",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://kheleel.com",
    siteName: "Kheleel | خليلي",
    title: "Kheleel | خليلي — ذكاء اصطناعي يتكلم عربي",
    description:
      "يفهم كل اللهجات العربية. محادثة نصية وصوتية، أدوات ذكية، وخصوصية كاملة. مجاني.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Kheleel — خليلي" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kheleel | خليلي — ذكاء اصطناعي يتكلم عربي",
    description:
      "يفهم كل اللهجات العربية. محادثة نصية وصوتية، أدوات ذكية، وخصوصية كاملة.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "https://kheleel.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" translate="no" suppressHydrationWarning className={`notranslate ${arefRuqaa.variable} ${amiri.variable} ${notoNaskh.variable} ${notoNastaliq.variable}`}>
      <head>
        <meta name="google" content="notranslate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Kheleel | خليلي",
              url: "https://kheleel.com",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              description:
                "ذكاء اصطناعي يتكلم عربي — يفهم كل اللهجات: عراقي، مصري، خليجي، شامي، مغربي. محادثة صوتية، أدوات ذكية، وخصوصية كاملة.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              inLanguage: ["ar", "ar-IQ", "ar-EG", "ar-SA", "ar-SY", "ar-MA"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kheleel",
              alternateName: "خليلي",
              url: "https://kheleel.com",
              logo: "https://kheleel.com/logo/logo_black.svg",
              description:
                "ذكاء اصطناعي عربي يفهم كل اللهجات. يسد الفجوة التقنية لأربعمئة مليون ناطق بالعربية.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@kheleel.com",
                contactType: "customer service",
                availableLanguage: ["Arabic", "English"],
              },
            }),
          }}
        />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.setAttribute("data-theme","dark");var s=localStorage.getItem("kheleel_accent_color");if(s){var h=s.replace(/^#/,""),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),d=function(a){return"#"+[r,g,b].map(function(c){return Math.max(0,Math.floor(c*(1-a))).toString(16).padStart(2,"0")}).join("")},root=document.documentElement;root.style.setProperty("--color-accent",s);root.style.setProperty("--color-accent-hover",d(0.15));root.style.setProperty("--color-accent-avatar-expanded",d(0.25));root.style.setProperty("--color-accent-avatar-collapsed",d(0.4));root.style.setProperty("--color-earth",d(0.45));root.style.setProperty("--color-accent-tint-12","rgba("+r+","+g+","+b+",0.12)");root.style.setProperty("--color-accent-tint-08","rgba("+r+","+g+","+b+",0.08)");root.style.setProperty("--color-accent-tint-20","rgba("+r+","+g+","+b+",0.2)");root.style.setProperty("--color-accent-tint-25","rgba("+r+","+g+","+b+",0.25)");root.style.setProperty("--color-accent-tint-10","rgba("+r+","+g+","+b+",0.1)");root.style.setProperty("--color-accent-tint-06","rgba("+r+","+g+","+b+",0.06)");root.style.setProperty("--color-accent-tint-40","rgba("+r+","+g+","+b+",0.4)");}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <ThemeProvider>
            <ThemeColorProvider>{children}</ThemeColorProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

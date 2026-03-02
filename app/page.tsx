import { HomeHero } from "@/components/HomeHero";

function JsonLd() {
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kheleel | خليلي",
    url: "https://kheleel.com",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description:
      "ذكاء اصطناعي يتكلم عربي — يفهم كل اللهجات: عراقي، مصري، خليجي، شامي، مغربي. محادثة صوتية، أدوات ذكية، وخصوصية كاملة.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    inLanguage: ["ar", "ar-IQ", "ar-EG", "ar-SA", "ar-SY", "ar-MA"],
  };

  const org = {
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <HomeHero />
    </>
  );
}

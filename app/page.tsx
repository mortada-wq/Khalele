import { Navbar, Hero, Features, HowItWorks, Vision, Footer } from "@/components/Landing";

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
      "Arabic AI assistant that understands every dialect. Bridging the AI gap for 400 million Arabic speakers.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@kheleel.com",
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://kheleel.com" },
      { "@type": "ListItem", position: 2, name: "ابدأ المحادثة", item: "https://kheleel.com/chat" },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <div style={{ background: "#ebebec" }} dir="rtl">
      <JsonLd />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Vision />
      </main>
      <Footer />
    </div>
  );
}

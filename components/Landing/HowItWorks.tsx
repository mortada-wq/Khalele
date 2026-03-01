const STEPS = [
  {
    number: "١",
    title: "اكتب أو تكلم",
    description: "اكتب بأي لهجة عربية أو استخدم صوتك مباشرة.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    number: "٢",
    title: "خليل يفهمك",
    description: "يفهم لهجتك، سياقك، واحتياجك — بدون ما تشرح.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    number: "٣",
    title: "استفد",
    description: "احصل على إجابات، ترجمة، صور، أو محادثة صوتية طبيعية.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      className="px-6 md:px-10 py-16 md:py-24"
      style={{ background: "rgba(0,0,0,0.02)" }}
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-title text-2xl md:text-3xl font-bold text-center mb-14"
          style={{ color: "#231f20" }}
        >
          كيف يعمل؟
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: "var(--color-accent-tint-12)",
                  border: "2px solid var(--color-accent-tint-25)",
                  color: "var(--color-accent)",
                }}
              >
                {step.icon}
              </div>
              <span
                className="font-title text-sm font-bold mb-1"
                style={{ color: "var(--color-accent)" }}
              >
                الخطوة {step.number}
              </span>
              <h3
                className="font-ui text-base font-semibold mb-2"
                style={{ color: "#231f20" }}
              >
                {step.title}
              </h3>
              <p
                className="font-ui text-sm leading-relaxed"
                style={{ color: "#6b6b6b" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

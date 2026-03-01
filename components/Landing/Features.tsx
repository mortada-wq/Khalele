const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "محادثة صوتية",
    description: "تكلم بصوتك وخليلي يسمعك ويرد عليك. بكل اللهجات العربية.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    title: "سوق الأدوات",
    description: "ترجمان، تصاوير، موسيقى، دفتر ملاحظات — اختر أدواتك المفضلة.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "خصوصية كاملة",
    description: "وضع التصفح الخفي. بياناتك لك وحدك. ما نبيع ولا نشارك شيء.",
  },
];

export function Features() {
  return (
    <section className="px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-title text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: "#231f20" }}
        >
          كل شي تحتاجه — <span style={{ color: "var(--color-accent)" }}>مجاناً</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:-translate-y-1"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                style={{
                  background: "var(--color-accent-tint-08)",
                  color: "var(--color-accent)",
                }}
              >
                {f.icon}
              </div>
              <h3
                className="font-ui text-base font-semibold mb-2"
                style={{ color: "#231f20" }}
              >
                {f.title}
              </h3>
              <p
                className="font-ui text-sm leading-relaxed"
                style={{ color: "#6b6b6b" }}
              >
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

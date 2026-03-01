import Link from "next/link";

export function Vision() {
  return (
    <section className="px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6"
          style={{
            background: "var(--color-accent-tint-12)",
            border: "1px solid var(--color-accent-tint-25)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <blockquote
          className="font-body text-xl md:text-2xl leading-relaxed mb-6"
          style={{ color: "#231f20" }}
        >
          &ldquo;العالم يتحول للذكاء الاصطناعي، لكن الشركات الكبيرة نسيت العرب.
          <br />
          <span style={{ color: "var(--color-accent)" }}>احنا نبني هذا عشان جدتك تقدر تسأل الكمبيوتر بنفس اللغة اللي تحكي فيها بالبيت.</span>&rdquo;
        </blockquote>

        <p className="font-ui text-sm mb-8" style={{ color: "#999" }}>
          صنع بحب للعالم العربي
        </p>

        <Link
          href="/chat"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-ui text-base font-medium transition-all hover:shadow-lg active:scale-[0.97]"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
        >
          جرّب خليلي الآن — مجاناً
        </Link>
      </div>
    </section>
  );
}

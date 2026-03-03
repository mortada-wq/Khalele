"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Loader2, Check, AlertCircle } from "lucide-react";

const STRESS_TEST_PROMPTS = [
  "اشرح لي ميكانيكا الكم بالعربية البسيطة",
  "ما الفرق بين الفصحى والعامية؟",
  "كيف أقدم نفسي في مقابلة عمل؟",
  "شلونك اليوم؟",
  "Explain quantum physics in simple Arabic",
  "اكتب لي رسالة رسمية لمدير الشركة",
];

export default function VolunteerPage() {
  const [prompt, setPrompt] = useState("");
  const [languageStyle, setLanguageStyle] = useState<"easy_arabic" | "formal_msa">("easy_arabic");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<"perfect" | "needs_tweak" | "wrong_level" | null>(null);
  const [correctedText, setCorrectedText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text) {
      setError("اكتب سؤالاً أو اختر واحداً من الاقتراحات");
      return;
    }
    setError("");
    setLoading(true);
    setAiResponse("");
    setVerdict(null);
    setCorrectedText("");
    try {
      const res = await fetch("/api/volunteer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, languageStyle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التوليد");
      setAiResponse(data.content || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل التوليد");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!aiResponse) return;
    if (verdict === "needs_tweak" && !correctedText.trim()) {
      setError("اكتب الصيغة الصحيحة للإجابة");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/volunteer/gold-example", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPrompt: prompt.trim(),
          originalResponse: aiResponse,
          correctedResponse: verdict === "needs_tweak" ? correctedText.trim() : undefined,
          languageStyle,
          verdict: verdict || "needs_tweak",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center" dir="rtl">
        <div className="max-w-md text-center">
          <Check className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--color-accent)" }} />
          <h1 className="text-2xl font-bold mb-2">شكراً لمشاركتك!</h1>
          <p className="text-[#6b6b6b] mb-6">
            تم استلام تصحيحك. فريقنا سيراجعه لتحسين خليلي.
          </p>
          <Link
            href="/volunteer"
            className="inline-block px-6 py-3 rounded-xl font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            تصحيح آخر
          </Link>
          <Link
            href="/"
            className="block mt-3 text-sm"
            style={{ color: "var(--color-accent)" }}
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#fafafa", color: "#231f20" }}>
      <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        <Link href="/" className="font-bold text-xl" style={{ color: "var(--color-accent)" }}>
          خليلي — صقل التصحيحات
        </Link>
        <Link href="/" className="text-sm" style={{ color: "#6b6b6b" }}>
          العودة
        </Link>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Privacy reminder */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ borderColor: "var(--color-accent-tint-25)", background: "var(--color-accent-tint-12)" }}
        >
          <AlertCircle size={20} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            لا تدخل بيانات حقيقية لأشخاص أو قضايا. استخدم أمثلة افتراضية فقط.
          </p>
        </div>

        {/* Language style */}
        <section className="p-6 rounded-2xl border" style={{ borderColor: "#e5e5e5", background: "#fff" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
            مستوى اللغة
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguageStyle("easy_arabic")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: languageStyle === "easy_arabic" ? "var(--color-accent)" : "#f0f0f0",
                color: languageStyle === "easy_arabic" ? "#fff" : "#333",
              }}
            >
              عربية سهلة
            </button>
            <button
              type="button"
              onClick={() => setLanguageStyle("formal_msa")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: languageStyle === "formal_msa" ? "var(--color-accent)" : "#f0f0f0",
                color: languageStyle === "formal_msa" ? "#fff" : "#333",
              }}
            >
              فصحى رسمية
            </button>
          </div>
        </section>

        {/* Prompt input */}
        <section className="p-6 rounded-2xl border" style={{ borderColor: "#e5e5e5", background: "#fff" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
            السؤال أو الاختبار
          </h2>
          <p className="text-sm mb-3" style={{ color: "#6b6b6b" }}>
            اختر سؤالاً صعباً أو اكتب سؤالك. الأسئلة الصعبة تعطي تصحيحات أفضل.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {STRESS_TEST_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="px-3 py-1.5 rounded-lg text-xs border transition-colors"
                style={{
                  borderColor: prompt === p ? "var(--color-accent)" : "#e0e0e0",
                  background: prompt === p ? "var(--color-accent-tint-12)" : "#fff",
                  color: prompt === p ? "var(--color-accent)" : "#333",
                }}
              >
                {p.slice(0, 35)}{p.length > 35 ? "…" : ""}
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب سؤالك أو اختر من الاقتراحات..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
            style={{ borderColor: "#e0e0e0" }}
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-3 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-white disabled:opacity-50"
            style={{ background: "var(--color-accent)" }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Send size={20} />
                توليد إجابة
              </>
            )}
          </button>
        </section>

        {/* AI response + verdict */}
        {aiResponse && (
          <section className="p-6 rounded-2xl border" style={{ borderColor: "#e5e5e5", background: "#fff" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
              إجابة خليلي
            </h2>
            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "#fafafa", borderColor: "#e5e5e5", border: "1px solid" }}
            >
              <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
            </div>

            <p className="text-sm mb-3" style={{ color: "#6b6b6b" }}>
              كيف تقيّم هذه الإجابة؟
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setVerdict("perfect");
                  setCorrectedText("");
                }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: verdict === "perfect" ? "#22c55e" : "#f0f0f0",
                  color: verdict === "perfect" ? "#fff" : "#333",
                }}
              >
                ممتاز
              </button>
              <button
                type="button"
                onClick={() => setVerdict("needs_tweak")}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: verdict === "needs_tweak" ? "var(--color-accent)" : "#f0f0f0",
                  color: verdict === "needs_tweak" ? "#fff" : "#333",
                }}
              >
                يحتاج تعديل
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerdict("wrong_level");
                  setCorrectedText("");
                }}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: verdict === "wrong_level" ? "#d14d72" : "#f0f0f0",
                  color: verdict === "wrong_level" ? "#fff" : "#333",
                }}
              >
                مستوى خاطئ
              </button>
            </div>

            {verdict === "needs_tweak" && (
              <textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                placeholder="اكتب الصيغة الصحيحة للإجابة..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none mb-4"
                style={{ borderColor: "#e0e0e0" }}
              />
            )}

            {error && (
              <p className="text-sm mb-3" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !verdict || (verdict === "needs_tweak" && !correctedText.trim())}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white disabled:opacity-50"
              style={{ background: "var(--color-accent)" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال التصحيح"
              )}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

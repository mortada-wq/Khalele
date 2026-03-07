"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Mic, MicOff, Send, Loader2, Check } from "lucide-react";

const DEFAULT_PROMPTS = [
  "مرحبا كيف حالك",
  "أنا من بغداد",
  "شلونك يا خوي",
  "الحمد لله كل شي تمام",
  "وين تروح النهاردة",
];

const USER_ID_KEY = "kheleel_user_id";

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anon_anonymous";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export default function TrainingPage() {
  const [nativeSpeaker, setNativeSpeaker] = useState(true);
  const [dialect, setDialect] = useState("");
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("");
  const prompts = DEFAULT_PROMPTS;
  const [recordings, setRecordings] = useState<Record<number, Blob>>({});
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordings((r) => ({ ...r, [index]: blob }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordingIndex(index);
    } catch {
      alert("تعذر الوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecordingIndex(null);
  };

  const handleSubmit = async () => {
    const recordedIndices = Object.keys(recordings).map(Number);
    if (recordedIndices.length === 0) {
      alert("سجّل صوتاً لفقرة واحدة على الأقل");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nativeSpeaker", String(nativeSpeaker));
      if (dialect) formData.append("dialect", dialect);
      if (region) formData.append("region", region);
      if (gender) formData.append("gender", gender);
      formData.append("prompts", JSON.stringify(prompts));

      for (const i of recordedIndices) {
        const blob = recordings[i];
        if (blob) {
          formData.append(`audio_${i}`, blob, `prompt_${i}.webm`);
        }
        const transcript = transcripts[i] ?? "";
        formData.append(`transcript_${i}`, transcript);
      }

      const res = await fetch("/api/training/submit", {
        method: "POST",
        headers: { "x-user-id": getOrCreateUserId() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "فشل الإرسال");
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "فشل الإرسال");
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
            تم استلام تسجيلاتك. فريقنا سيراجعها قريباً لتحسين خليل.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-medium text-white"
            style={{ background: "var(--color-accent)" }}
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
          خليل — المساهمة بالبيانات
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/volunteer" className="text-sm" style={{ color: "var(--color-accent)" }}>
            صقل التصحيحات
          </Link>
          <Link href="/" className="text-sm" style={{ color: "#6b6b6b" }}>
            العودة
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        <section className="p-6 rounded-2xl border" style={{ borderColor: "#e5e5e5", background: "#fff" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
            معلوماتك
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nativeSpeaker}
                onChange={(e) => setNativeSpeaker(e.target.checked)}
                className="rounded accent-accent"
              />
              <span className="text-sm">متحدث أصلي بالعربية</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">اللهجة</label>
              <input
                type="text"
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                placeholder="مثال: بغدادي، مصري"
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e0e0e0" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المنطقة (اختياري)</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="مثال: بغداد، القاهرة"
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e0e0e0" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الجنس (اختياري)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border text-sm"
                style={{ borderColor: "#e0e0e0" }}
              >
                <option value="">—</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>
        </section>

        <section className="p-6 rounded-2xl border" style={{ borderColor: "#e5e5e5", background: "#fff" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-accent)" }}>
            اقرأ هذه العبارات بصوتك
          </h2>
          <p className="text-sm mb-4" style={{ color: "#6b6b6b" }}>
            اضغط على الميكروفون وسجّل نفسك تقرأ كل عبارة. اكتب ما قلته في الحقل أسفل كل عبارة.
          </p>
          <div className="space-y-4">
            {prompts.map((prompt, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border"
                style={{ borderColor: "#e5e5e5", background: "#fafafa" }}
              >
                <p className="font-medium mb-2">{prompt}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => (recordingIndex === i ? stopRecording() : startRecording(i))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: recordingIndex === i ? "#dc2626" : "var(--color-accent-tint-12)",
                      color: recordingIndex === i ? "#fff" : "var(--color-accent)",
                      border: `1px solid ${recordingIndex === i ? "#dc2626" : "var(--color-accent-tint-25)"}`,
                    }}
                  >
                    {recordingIndex === i ? (
                      <>
                        <MicOff size={18} />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        {recordings[i] ? "إعادة التسجيل" : "تسجيل"}
                      </>
                    )}
                  </button>
                  {recordings[i] && (
                    <span className="text-xs" style={{ color: "#22c55e" }}>
                      ✓ مسجّل
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={transcripts[i] ?? ""}
                  onChange={(e) => setTranscripts((t) => ({ ...t, [i]: e.target.value }))}
                  placeholder="ما قلته (اختياري للتأكيد)"
                  className="mt-2 w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#e0e0e0" }}
                />
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(recordings).length === 0}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--color-accent)" }}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send size={20} />
              إرسال المساهمة
            </>
          )}
        </button>
      </div>
    </main>
  );
}

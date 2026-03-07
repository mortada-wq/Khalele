"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, Check, X, Loader2, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TrainingSession {
  sessionId: string;
  userId: string;
  nativeSpeaker: boolean;
  dialect?: string;
  region?: string;
  gender?: string;
  audioFiles: string[];
  transcripts: string[];
  status: "pending" | "approved" | "rejected";
  metadata?: { prompts?: string[] };
  createdAt: string;
  updatedAt: string;
}

export default function AdminTrainingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/training-sessions${params}`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSessions(data.sessions ?? []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    fetchSessions();
  }, [filter, session, status, router]);

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/admin/training-sessions/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) fetchSessions();
  };

  const handleReject = async (id: string) => {
    const res = await fetch(`/api/admin/training-sessions/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) fetchSessions();
  };

  const playAudio = (s3Uri: string) => {
    if (playingId) return;
    setPlayingId(s3Uri);
    fetch(`/api/training/audio?uri=${encodeURIComponent(s3Uri)}`)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
          audioUrlRef.current = null;
          setPlayingId(null);
        };
      })
      .catch(() => setPlayingId(null));
  };

  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const approvedCount = sessions.filter((s) => s.status === "approved").length;
  const rejectedCount = sessions.filter((s) => s.status === "rejected").length;

  if (status === "loading" || (session?.user?.role !== "admin")) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليل — جلسات التدريب
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/training" className="text-[#000000] hover:text-kheleel-gold text-sm">
            صفحة المساهمة
          </Link>
          <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
            العودة
          </Link>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={fetchSessions}
          className="px-4 py-2 rounded-lg bg-kheleel-gold/20 border border-kheleel-gold/40 text-kheleel-gold hover:bg-kheleel-gold/30 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <p className="text-[#8c8c8c] text-sm mb-1">قيد المراجعة</p>
          <p className="text-2xl font-bold text-kheleel-gold">{pendingCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <p className="text-[#8c8c8c] text-sm mb-1">مقبولة</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <p className="text-[#8c8c8c] text-sm mb-1">مرفوضة</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-kheleel-gold/20 border-kheleel-gold/40 border" : "bg-white border-[#e5e5e5] border hover:bg-[#f0f0f0]"
            }`}
          >
            {f === "pending" && "قيد المراجعة"}
            {f === "all" && "الكل"}
            {f === "approved" && "مقبولة"}
            {f === "rejected" && "مرفوضة"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-kheleel-gold" />
        </div>
      ) : sessions.length === 0 ? (
        <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <p className="text-[#8c8c8c]">لا توجد جلسات تدريب.</p>
          <Link href="/training" className="text-kheleel-gold hover:underline mt-2 inline-block">
            ادعُ المتطوعين للمساهمة
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <section
              key={s.sessionId}
              className="p-6 rounded-2xl bg-white border border-[#e5e5e5]"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-sm text-[#8c8c8c]">{s.sessionId}</p>
                  <p className="text-[#8c8c8c] text-xs mt-1">
                    {new Date(s.createdAt).toLocaleString("ar")}
                  </p>
                  <p className="text-[#8c8c8c] text-sm mt-1">
                    متحدث أصلي: {s.nativeSpeaker ? "نعم" : "لا"}
                    {s.dialect && ` • اللهجة: ${s.dialect}`}
                    {s.region && ` • المنطقة: ${s.region}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    s.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : s.status === "approved"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-red-500/20 text-red-600"
                  }`}
                >
                  {s.status === "pending" && "قيد المراجعة"}
                  {s.status === "approved" && "مقبولة"}
                  {s.status === "rejected" && "مرفوضة"}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {s.metadata?.prompts?.map((prompt, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#fafafa]">
                    <p className="text-[#000000]">{prompt}</p>
                    {s.transcripts[i] && (
                      <p className="text-kheleel-gold/80 text-sm mt-1">{s.transcripts[i]}</p>
                    )}
                    {s.audioFiles[i] && (
                      <button
                        type="button"
                        onClick={() => playAudio(s.audioFiles[i])}
                        disabled={!!playingId}
                        className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0f0f0] hover:bg-[#e5e5e5] text-sm disabled:opacity-50"
                      >
                        {playingId === s.audioFiles[i] ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Mic size={14} />
                        )}
                        استمع
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {s.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(s.sessionId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-600 hover:bg-green-500/30"
                  >
                    <Check size={18} />
                    قبول
                  </button>
                  <button
                    onClick={() => handleReject(s.sessionId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-600 hover:bg-red-500/30"
                  >
                    <X size={18} />
                    رفض
                  </button>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

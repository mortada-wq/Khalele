"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, Check, X, Loader2, RefreshCw } from "lucide-react";

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
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState("");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = filter === "all" ? "" : `?status=${filter}`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminSecret) headers["x-admin-secret"] = adminSecret;
      const res = await fetch(`/api/admin/training-sessions${params}`, { headers });
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
    fetchSessions();
  }, [filter]);

  const handleApprove = async (id: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminSecret) headers["x-admin-secret"] = adminSecret;
    const res = await fetch(`/api/admin/training-sessions/${id}/approve`, {
      method: "POST",
      headers,
    });
    if (res.ok) fetchSessions();
  };

  const handleReject = async (id: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (adminSecret) headers["x-admin-secret"] = adminSecret;
    const res = await fetch(`/api/admin/training-sessions/${id}/reject`, {
      method: "POST",
      headers,
    });
    if (res.ok) fetchSessions();
  };

  const playAudio = (s3Uri: string) => {
    if (playingId) return;
    setPlayingId(s3Uri);
    const headers: Record<string, string> = {};
    if (adminSecret) headers["x-admin-secret"] = adminSecret;
    fetch(`/api/training/audio?uri=${encodeURIComponent(s3Uri)}`, { headers })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setPlayingId(null);
        };
      })
      .catch(() => setPlayingId(null));
  };

  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const approvedCount = sessions.filter((s) => s.status === "approved").length;
  const rejectedCount = sessions.filter((s) => s.status === "rejected").length;

  return (
    <main className="min-h-screen p-8" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-khalele-gold font-bold text-2xl">
          خليلي — جلسات التدريب
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/training" className="text-white/80 hover:text-khalele-gold text-sm">
            صفحة المساهمة
          </Link>
          <Link href="/admin" className="text-white/80 hover:text-khalele-gold">
            العودة
          </Link>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2">
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="كلمة سر الأدمن (إن وُجدت)"
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
          />
          <button
            onClick={fetchSessions}
            className="px-4 py-2 rounded-lg bg-khalele-gold/20 border border-khalele-gold/40 text-khalele-gold hover:bg-khalele-gold/30 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            تحديث
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm mb-1">قيد المراجعة</p>
          <p className="text-2xl font-bold text-khalele-gold">{pendingCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm mb-1">مقبولة</p>
          <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm mb-1">مرفوضة</p>
          <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-khalele-gold/20 border-khalele-gold/40 border" : "bg-white/5 border-white/10 border hover:bg-white/10"
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
          <Loader2 size={32} className="animate-spin text-khalele-gold" />
        </div>
      ) : sessions.length === 0 ? (
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/60">لا توجد جلسات تدريب.</p>
          <Link href="/training" className="text-khalele-gold hover:underline mt-2 inline-block">
            ادعُ المتطوعين للمساهمة
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {sessions.map((s) => (
            <section
              key={s.sessionId}
              className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-sm text-white/60">{s.sessionId}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {new Date(s.createdAt).toLocaleString("ar")}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    متحدث أصلي: {s.nativeSpeaker ? "نعم" : "لا"}
                    {s.dialect && ` • اللهجة: ${s.dialect}`}
                    {s.region && ` • المنطقة: ${s.region}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    s.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : s.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {s.status === "pending" && "قيد المراجعة"}
                  {s.status === "approved" && "مقبولة"}
                  {s.status === "rejected" && "مرفوضة"}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {s.metadata?.prompts?.map((prompt, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5">
                    <p className="text-white/80">{prompt}</p>
                    {s.transcripts[i] && (
                      <p className="text-khalele-gold/80 text-sm mt-1">{s.transcripts[i]}</p>
                    )}
                    {s.audioFiles[i] && (
                      <button
                        type="button"
                        onClick={() => playAudio(s.audioFiles[i])}
                        disabled={!!playingId}
                        className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                  >
                    <Check size={18} />
                    قبول
                  </button>
                  <button
                    onClick={() => handleReject(s.sessionId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
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

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalSessions: number;
  pendingSessions: number;
  approvedSessions: number;
  rejectedSessions: number;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5 font-ui"
      style={{
        background: accent ? "var(--color-accent-tint-12)" : "#ffffff",
        border: accent ? "1px solid var(--color-accent-tint-25)" : "1px solid #e5e5e5",
      }}
    >
      <p className="text-xs mb-1" style={{ color: "#8c8c8c" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: accent ? "var(--color-accent)" : "#000000" }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/admin/training-sessions");
        if (res.ok) {
          const data = await res.json();
          const sessions = data.sessions || [];
          setStats({
            totalSessions: sessions.length,
            pendingSessions: sessions.filter((s: { status: string }) => s.status === "pending").length,
            approvedSessions: sessions.filter((s: { status: string }) => s.status === "approved").length,
            rejectedSessions: sessions.filter((s: { status: string }) => s.status === "rejected").length,
          });
        }
      } catch {
        // Fallback to zeros
        setStats({ totalSessions: 0, pendingSessions: 0, approvedSessions: 0, rejectedSessions: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  if (status === "loading" || (session?.user?.role !== "admin")) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#ebebec" }}>
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ background: "#ffffff", borderBottom: "1px solid #e5e5e5" }}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 100 }}>
            <img src="/logo/logo_black.svg" alt="خليل" className="w-full h-auto" />
          </div>
          <span
            className="font-ui text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #D4A017, #FFD700)", color: "#fff" }}
          >
            مدير
          </span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="font-ui text-sm px-4 py-2 rounded-xl transition-colors hover:bg-black/5"
          style={{ color: "var(--color-accent)" }}
        >
          الرجوع للرئيسية
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-ui text-xl font-bold mb-6" style={{ color: "#000000" }}>
          لوحة التحكم
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري تحميل البيانات...</span>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="إجمالي الجلسات" value={stats.totalSessions} />
              <StatCard label="في الانتظار" value={stats.pendingSessions} accent />
              <StatCard label="مقبولة" value={stats.approvedSessions} />
              <StatCard label="مرفوضة" value={stats.rejectedSessions} />
            </div>

            <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
              <h2 className="font-ui text-sm font-semibold mb-4" style={{ color: "#000000" }}>
                إجراءات سريعة
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/chat")}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  فتح المحادثة
                </button>
                <button
                  onClick={() => router.push("/admin/messaging")}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                  style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
                >
                  إدارة الرسائل
                </button>
                <button
                  onClick={() => router.push("/admin/admins")}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                  style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
                >
                  إدارة المديرين
                </button>
                <button
                  onClick={() => router.push("/admin/fact-check")}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                  style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
                >
                  فحص الحقائق
                </button>
                <button
                  onClick={() => router.push("/admin/tahseen-khaleel")}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                  style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
                >
                  تحرير تحسين خليل
                </button>
                <button
                  onClick={() => {
                    setLoading(true);
                    window.location.reload();
                  }}
                  className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-black/5"
                  style={{ background: "#f5f5f5", color: "#000000" }}
                >
                  تحديث البيانات
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="font-ui text-sm" style={{ color: "#8c8c8c" }}>لا توجد بيانات</p>
        )}

        <p className="font-ui text-xs mt-8" style={{ color: "#aaa" }}>
          مسجّل كـ {session.user?.email}
        </p>
      </main>
    </div>
  );
}

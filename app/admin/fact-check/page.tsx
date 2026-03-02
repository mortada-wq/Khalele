"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { FactCheckMode } from "@/lib/factcheck-config";

interface FactConfig {
  defaultMode: FactCheckMode;
  forceOn: boolean;
  updatedAt: string;
}

const MODES: { id: FactCheckMode; label: string }[] = [
  { id: "off", label: "إيقاف" },
  { id: "notify", label: "إشعار" },
  { id: "notify_with_reason", label: "إشعار مع السبب" },
];

export default function AdminFactCheckPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<FactConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/fact-config");
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as FactConfig;
        setConfig(data);
      } catch {
        setMessage({ type: "err", text: "فشل تحميل الإعدادات" });
      }
    })();
  }, [session, status, router]);

  const save = async (updates: Partial<FactConfig>) => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/fact-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      setConfig(data as FactConfig);
      setMessage({ type: "ok", text: "تم الحفظ" });
    } catch {
      setMessage({ type: "err", text: "فشل الحفظ" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (status === "loading" || session?.user?.role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
        <header className="flex items-center justify-between mb-12">
          <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
            خليلي — فحص الحقائق
          </Link>
          <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
            العودة
          </Link>
        </header>
        <p className="text-[#8c8c8c]">جاري التحميل...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-10">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — فحص الحقائق
        </Link>
        <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl ${
            message.type === "ok" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#000000" }}>الوضع الافتراضي</p>
            <p className="text-xs" style={{ color: "#666" }}>يطبق على كل المحادثات ما لم تُعدّل محلياً</p>
          </div>
          <select
            value={config.defaultMode}
            onChange={(e) => save({ defaultMode: e.target.value as FactCheckMode })}
            disabled={saving}
            className="px-3 py-2 rounded-lg border"
            style={{ borderColor: "#e5e5e5" }}
          >
            {MODES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#000000" }}>إجبار التشغيل</p>
            <p className="text-xs" style={{ color: "#666" }}>يتجاهل إعدادات المجموعات إذا فعّلته</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.forceOn}
              onChange={(e) => save({ forceOn: e.target.checked })}
              disabled={saving}
              className="accent-accent"
            />
            <span style={{ color: "#000000" }}>{config.forceOn ? "مفعّل" : "معطّل"}</span>
          </label>
        </div>

        <p className="text-xs" style={{ color: "#777" }}>
          آخر تحديث: {new Date(config.updatedAt).toLocaleString("ar")}
        </p>
      </section>
    </main>
  );
}


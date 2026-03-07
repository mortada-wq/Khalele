"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Type,
  Plus,
  Trash2,
  Save,
  Pencil,
  GripVertical,
  RotateCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Tagline {
  id: string;
  text: string;
  order: number;
  active: boolean;
  createdAt: string;
}

interface TaglineConfig {
  taglines: Tagline[];
  rotationEnabled: boolean;
  rotationIntervalMinutes: number;
  activeTaglineId: string | null;
}

export default function AdminTaglinesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<TaglineConfig | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    fetch("/api/taglines")
      .then((r) => r.json())
      .then((d) => setConfig(d))
      .catch(() => setMessage({ type: "err", text: "فشل التحميل" }));
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    load();
  }, [session, status, router]);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveConfig = async (updates: Partial<TaglineConfig>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "config", ...updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config ?? { ...config, ...updates });
        showMsg("ok", "تم الحفظ");
      } else showMsg("err", data.error || "فشل الحفظ");
    } catch {
      showMsg("err", "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addTagline = async () => {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", text: newText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        load();
        setNewText("");
        showMsg("ok", "تمت الإضافة");
      } else showMsg("err", data.error || "فشل الإضافة");
    } catch {
      showMsg("err", "فشل الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const updateTagline = async (id: string, text: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id, text }),
      });
      if (res.ok) {
        load();
        setEditingId(null);
        setEditText("");
        showMsg("ok", "تم التحديث");
      } else {
        const data = await res.json();
        showMsg("err", data.error || "فشل التحديث");
      }
    } catch {
      showMsg("err", "فشل التحديث");
    } finally {
      setSaving(false);
    }
  };

  const deleteTagline = async (id: string) => {
    if (!confirm("حذف هذا الشعار؟")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (res.ok) {
        load();
        showMsg("ok", "تم الحذف");
      } else {
        const data = await res.json();
        showMsg("err", data.error || "فشل الحذف");
      }
    } catch {
      showMsg("err", "فشل الحذف");
    } finally {
      setSaving(false);
    }
  };

  const toggleRotation = () => {
    const next = !config?.rotationEnabled;
    saveConfig({ rotationEnabled: next });
  };

  const setActiveTagline = (id: string) => {
    saveConfig({ activeTaglineId: id, rotationEnabled: false });
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
            خليل — بنك الشعارات
          </Link>
          <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
            العودة
          </Link>
        </header>
        <p className="text-[#8c8c8c]">جاري التحميل...</p>
      </main>
    );
  }

  const sorted = [...config.taglines].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليل — بنك الشعارات
        </Link>
        <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl ${
            message.type === "ok" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Rotation control */}
      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5] mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#000000" }}>
          <RotateCw size={22} />
          تبديل الشعار تلقائياً
        </h2>
        <p className="text-[#8c8c8c] text-sm mb-4">
          عند التفعيل، يتم التبديل بين آخر 5 شعارات مضافة (أو جميع الشعارات إذا كانت أقل من 5). التبديل يحدث كل ساعة.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={toggleRotation}
            className="flex items-center gap-2 text-[#000000] hover:text-kheleel-gold transition-colors"
          >
            {config.rotationEnabled ? (
              <ToggleRight size={32} className="text-kheleel-gold" />
            ) : (
              <ToggleLeft size={32} className="text-[#8c8c8c]" />
            )}
            <span>{config.rotationEnabled ? "مفعّل (كل ساعة)" : "معطّل"}</span>
          </button>

          {!config.rotationEnabled && sorted.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#8c8c8c] text-sm">الشعار الثابت:</span>
              <select
                value={config.activeTaglineId ?? ""}
                onChange={(e) => setActiveTagline(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e5e5e5]"
              >
                {sorted.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.text.length > 40 ? t.text.slice(0, 40) + "…" : t.text}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Tagline bank */}
      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5] mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#000000" }}>
          <Type size={22} />
          بنك الشعارات
        </h2>
        <p className="text-[#8c8c8c] text-sm mb-6">
          أضف، عدّل، واحذف الشعارات. اختر شعاراً ثابتاً أو فعّل التبديل التلقائي.
        </p>

        <div className="space-y-3 mb-6">
          {sorted.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"
            >
              <GripVertical size={18} className="text-[#8c8c8c] shrink-0" />
              {editingId === t.id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#fafafa] border border-[#e5e5e5]"
                    placeholder="نص الشعار"
                    autoFocus
                  />
                  <button
                    onClick={() => updateTagline(t.id, editText)}
                    disabled={saving || !editText.trim()}
                    className="p-2 rounded-lg bg-kheleel-gold/20 text-kheleel-gold hover:bg-kheleel-gold/30 disabled:opacity-50"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="p-2 rounded-lg text-[#8c8c8c] hover:text-[#000000]"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <p className="flex-1 font-ui" style={{ color: "#000000" }}>{t.text}</p>
                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setEditText(t.text);
                    }}
                    className="p-2 rounded-lg text-[#8c8c8c] hover:bg-[#f0f0f0] hover:text-kheleel-gold"
                    title="تعديل"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteTagline(t.id)}
                    disabled={saving}
                    className="p-2 rounded-lg text-red-500/80 hover:bg-red-500/20 hover:text-red-600 disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTagline()}
            className="flex-1 px-4 py-2 rounded-lg bg-[#fafafa] border border-[#e5e5e5]"
            placeholder="شعار جديد..."
          />
          <button
            onClick={addTagline}
            disabled={saving || !newText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kheleel-gold/20 text-kheleel-gold hover:bg-kheleel-gold/30 disabled:opacity-50"
          >
            <Plus size={18} />
            إضافة
          </button>
        </div>
      </section>

      <p className="text-[#8c8c8c] text-sm">
        الشعار يظهر في الصفحة الرئيسية. عند التبديل التلقائي، يتم التبديل بين آخر 5 شعارات كل ساعة.
      </p>
    </main>
  );
}

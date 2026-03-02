"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DocsTopic {
  id: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
  updatedAt: string;
}

interface DocsResponse {
  topics: DocsTopic[];
  updatedAt: string;
}

function buildTopic(order: number): DocsTopic {
  const now = new Date().toISOString();
  return {
    id: `topic_${crypto.randomUUID()}`,
    title: "",
    content: "",
    order,
    published: true,
    updatedAt: now,
  };
}

export default function AdminTahseenKhaleelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<DocsTopic[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 2500);
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/docs?all=1");
        if (!res.ok) throw new Error("Failed to fetch docs");
        const data = (await res.json()) as DocsResponse;
        const initial = Array.isArray(data.topics) ? data.topics : [];
        setTopics(initial.sort((a, b) => a.order - b.order));
      } catch {
        showMessage("err", "فشل تحميل موضوعات التوثيق");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, router]);

  const updateTopic = (id: string, patch: Partial<DocsTopic>) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id
          ? {
              ...topic,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : topic
      )
    );
  };

  const moveTopic = (index: number, direction: -1 | 1) => {
    setTopics((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const cloned = [...prev];
      const current = cloned[index];
      cloned[index] = cloned[nextIndex];
      cloned[nextIndex] = current;
      return cloned.map((topic, i) => ({ ...topic, order: i }));
    });
  };

  const save = async () => {
    const prepared = topics
      .map((topic, order) => ({
        ...topic,
        title: topic.title.trim(),
        content: topic.content.trim(),
        order,
      }))
      .filter((topic) => topic.title.length > 0);

    setSaving(true);
    try {
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: prepared }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      const saved = (data.config?.topics ?? prepared) as DocsTopic[];
      setTopics(saved.sort((a, b) => a.order - b.order));
      showMessage("ok", "تم حفظ توثيق تحسين خليل");
    } catch {
      showMessage("err", "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || session?.user?.role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-5 md:p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-ui text-xl md:text-2xl font-bold" style={{ color: "#231f20" }}>
            إدارة صفحة تحسين خليل
          </h1>
          <p className="font-ui text-sm mt-1" style={{ color: "#777" }}>
            تحكم بموضوعات التوثيق الرسمية المعروضة للمستخدمين.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="font-ui text-sm px-4 py-2 rounded-xl"
            style={{ background: "#ffffff", border: "1px solid #e5e5e5", color: "#444" }}
          >
            العودة
          </Link>
          <Link
            href="/tahseen-khaleel"
            className="font-ui text-sm px-4 py-2 rounded-xl"
            style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
          >
            معاينة الصفحة
          </Link>
        </div>
      </header>

      {message && (
        <div
          className="mb-5 px-4 py-3 rounded-xl font-ui text-sm"
          style={{
            background: message.type === "ok" ? "#e6f7eb" : "#ffe9e9",
            color: message.type === "ok" ? "#1b7f45" : "#b02a2a",
            border: `1px solid ${message.type === "ok" ? "#b9e8c9" : "#ffc5c5"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-2xl p-4 md:p-5 mb-5" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTopics((prev) => [...prev, buildTopic(prev.length)])}
            className="font-ui text-sm px-4 py-2 rounded-xl"
            style={{ background: "var(--color-accent-tint-12)", color: "var(--color-accent)" }}
          >
            إضافة موضوع جديد
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="font-ui text-sm px-4 py-2 rounded-xl text-white disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
            <p className="font-ui text-sm" style={{ color: "#777" }}>جاري تحميل الموضوعات...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
            <p className="font-ui text-sm" style={{ color: "#777" }}>
              لا توجد موضوعات حالياً. أضف موضوعاً لبدء صفحة تحسين خليل.
            </p>
          </div>
        ) : (
          topics
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((topic, index) => (
              <article
                key={topic.id}
                className="rounded-2xl p-4 md:p-5"
                style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}
              >
                <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
                  <h2 className="font-ui text-sm font-semibold" style={{ color: "#444" }}>
                    موضوع #{index + 1}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveTopic(index, -1)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-ui"
                      style={{ background: "#f2f2f2", color: "#555" }}
                    >
                      لأعلى
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTopic(index, 1)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-ui"
                      style={{ background: "#f2f2f2", color: "#555" }}
                    >
                      لأسفل
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopics((prev) => prev.filter((item) => item.id !== topic.id).map((item, i) => ({ ...item, order: i })))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-ui"
                      style={{ background: "#ffeaea", color: "#b02a2a" }}
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    value={topic.title}
                    onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                    placeholder="عنوان الموضوع"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-ui"
                    style={{ border: "1px solid #e3e3e3" }}
                  />
                  <textarea
                    value={topic.content}
                    onChange={(e) => updateTopic(topic.id, { content: e.target.value })}
                    placeholder="محتوى الموضوع"
                    rows={7}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-ui resize-y"
                    style={{ border: "1px solid #e3e3e3" }}
                  />
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={topic.published}
                      onChange={(e) => updateTopic(topic.id, { published: e.target.checked })}
                      className="accent-accent"
                    />
                    <span className="font-ui text-xs" style={{ color: "#666" }}>
                      منشور للمستخدمين
                    </span>
                  </label>
                </div>
              </article>
            ))
        )}
      </section>
    </main>
  );
}


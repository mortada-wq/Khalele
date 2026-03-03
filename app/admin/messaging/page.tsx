"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminMessagingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [greetingMessage, setGreetingMessage] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setGreetingMessage(data.greetingMessage || "");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGreeting = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ greetingMessage }),
      });

      if (res.ok) {
        setSuccess("تم حفظ رسالة الترحيب بنجاح");
      } else {
        setError("حدث خطأ في الحفظ");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      setError("الرجاء كتابة رسالة للإرسال");
      return;
    }

    setError("");
    setSuccess("");
    setBroadcasting(true);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`تم إرسال الرسالة إلى ${data.count} مستخدم`);
        setBroadcastMessage("");
      } else {
        setError(data.error || "حدث خطأ في الإرسال");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setBroadcasting(false);
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
          onClick={() => router.push("/admin")}
          className="font-ui text-sm px-4 py-2 rounded-xl transition-colors hover:bg-black/5"
          style={{ color: "var(--color-accent)" }}
        >
          الرجوع
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-ui text-xl font-bold mb-6" style={{ color: "#000000" }}>
          إدارة الرسائل والإعلانات
        </h1>

        {success && (
          <div className="mb-4 p-4 rounded-xl font-ui text-sm" style={{ background: "#d4edda", color: "#155724" }}>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl font-ui text-sm" style={{ background: "#f8d7da", color: "#721c24" }}>
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Greeting Message Section */}
          <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
            <h2 className="font-ui text-lg font-semibold mb-4" style={{ color: "#000000" }}>
              رسالة الترحيب للمستخدمين الجدد
            </h2>
            <p className="font-ui text-sm mb-4" style={{ color: "#767676" }}>
              هذه الرسالة تُرسل تلقائياً لكل مستخدم جديد عند إتمام التسجيل
            </p>
            
            {loading ? (
              <p className="font-ui text-sm" style={{ color: "#8c8c8c" }}>جاري التحميل...</p>
            ) : (
              <>
                <textarea
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg font-ui text-sm resize-none"
                  style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#1f1f1f" }}
                  placeholder="اكتب رسالة الترحيب هنا..."
                />
                
                <button
                  onClick={handleSaveGreeting}
                  disabled={saving}
                  className="mt-4 px-6 py-3 rounded-xl font-ui text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  {saving ? "جاري الحفظ..." : "حفظ رسالة الترحيب"}
                </button>
              </>
            )}
          </div>

          {/* Broadcast Section */}
          <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
            <h2 className="font-ui text-lg font-semibold mb-4" style={{ color: "#000000" }}>
              إرسال رسالة لجميع المستخدمين
            </h2>
            <p className="font-ui text-sm mb-4" style={{ color: "#767676" }}>
              استخدم هذه الأداة لإرسال إعلانات، أخبار، أو تحديثات مهمة لجميع المستخدمين
            </p>
            
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg font-ui text-sm resize-none"
              style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#1f1f1f" }}
              placeholder="اكتب رسالتك هنا..."
            />
            
            <div className="mt-4 p-4 rounded-lg" style={{ background: "#fff3cd", border: "1px solid #ffc107" }}>
              <p className="font-ui text-xs" style={{ color: "#856404" }}>
                ⚠️ تنبيه: سيتم إرسال هذه الرسالة لجميع المستخدمين المسجلين في التطبيق
              </p>
            </div>
            
            <button
              onClick={handleBroadcast}
              disabled={broadcasting || !broadcastMessage.trim()}
              className="mt-4 px-6 py-3 rounded-xl font-ui text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: "#dc3545", color: "#fff" }}
            >
              {broadcasting ? "جاري الإرسال..." : "إرسال لجميع المستخدمين"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Admin {
  email: string;
  name: string;
  createdAt: string;
}

export default function AdminsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
      return;
    }
    loadAdmins();
  }, [session, status, router]);

  const loadAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("تم إضافة المدير بنجاح");
        setEmail("");
        setPassword("");
        setName("");
        setShowAddForm(false);
        loadAdmins();
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
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
            <img src="/logo/logo_black.svg" alt="خليلي" className="w-full h-auto" />
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-ui text-xl font-bold" style={{ color: "#000000" }}>
            إدارة المديرين
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="font-ui text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            {showAddForm ? "إلغاء" : "إضافة مدير"}
          </button>
        </div>

        {success && (
          <div className="mb-4 p-4 rounded-xl font-ui text-sm" style={{ background: "#d4edda", color: "#155724" }}>
            {success}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddAdmin} className="mb-6 p-5 rounded-2xl" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
            <h2 className="font-ui text-sm font-semibold mb-4" style={{ color: "#000000" }}>
              إضافة مدير جديد
            </h2>
            
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg font-ui text-sm"
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#1f1f1f" }}
              />
              
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg font-ui text-sm"
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#1f1f1f" }}
              />
              
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg font-ui text-sm"
                style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", color: "#1f1f1f" }}
              />

              {error && (
                <p className="font-ui text-xs" style={{ color: "#d32f2f" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl font-ui text-sm font-medium transition-colors hover:opacity-90"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                إضافة
              </button>
            </div>
          </form>
        )}

        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e5e5e5" }}>
          {loading ? (
            <div className="p-8 text-center">
              <span className="font-ui text-sm" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
            </div>
          ) : admins.length === 0 ? (
            <div className="p-8 text-center">
              <span className="font-ui text-sm" style={{ color: "#8c8c8c" }}>لا يوجد مديرون</span>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#e5e5e5" }}>
              {admins.map((admin) => (
                <div key={admin.email} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-ui text-sm font-medium" style={{ color: "#000000" }}>
                      {admin.name}
                    </p>
                    <p className="font-ui text-xs mt-1" style={{ color: "#8c8c8c" }}>
                      {admin.email}
                    </p>
                  </div>
                  <span className="font-ui text-xs" style={{ color: "#aaa" }}>
                    {new Date(admin.createdAt).toLocaleDateString("ar")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, MessageSquare, Users, Settings, Type } from "lucide-react";

interface Correction {
  id: string;
  originalResponse: string;
  correctedResponse: string;
  correctionType: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [corrections, setCorrections] = useState<Correction[]>([]);

  useEffect(() => {
    fetch("/api/corrections")
      .then((r) => r.json())
      .then((d) => setCorrections(d.corrections || []))
      .catch(() => {});
  }, []);
  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-12">
        <Link href="/" className="text-khalele-gold font-bold text-2xl">
          خليلي — لوحة التحكم
        </Link>
        <Link
          href="/chat"
          className="text-white/80 hover:text-khalele-gold transition-colors"
        >
          العودة للمحادثة
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <BarChart3 className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">أداء النموذج</h3>
          <p className="text-white/60 text-sm">
            مراقبة دقة اللهجة وجودة الردود
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <MessageSquare className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">التصحيحات</h3>
          <p className="text-white/60 text-sm">
            معالجة تصحيحات المستخدمين
          </p>
        </div>
        <Link href="/admin/characters" className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors block">
          <Users className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">الشخصيات</h3>
          <p className="text-white/60 text-sm">
            إدارة الشخصيات واللهجات
          </p>
        </Link>
        <Link href="/admin/taglines" className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors block">
          <Type className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">بنك الشعارات</h3>
          <p className="text-white/60 text-sm">
            تعديل، حفظ، تبديل الشعار
          </p>
        </Link>
        <Link href="/admin/lexicons" className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors block">
          <BarChart3 className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">معاجم النطق</h3>
          <p className="text-white/60 text-sm">
            Polly Lexicons، لهجات
          </p>
        </Link>
        <Link href="/admin/data" className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors block">
          <Settings className="w-10 h-10 text-khalele-gold mb-4" />
          <h3 className="text-lg font-bold mb-2">استخراج البيانات</h3>
          <p className="text-white/60 text-sm">
            رفع التدريب، الميديا، التراث
          </p>
        </Link>
      </div>

      <div className="space-y-6">
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4">قائمة انتظار التدريب</h2>
          <p className="text-white/60">لا توجد مهام تدريب نشطة حالياً.</p>
        </section>

        <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4">آخر التصحيحات</h2>
          {corrections.length === 0 ? (
            <p className="text-white/60">لم يتم استلام تصحيحات بعد.</p>
          ) : (
            <ul className="space-y-4">
              {corrections.slice(0, 10).map((c) => (
                <li key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 line-through text-sm">{c.originalResponse}</p>
                  <p className="text-khalele-gold mt-1">{c.correctedResponse}</p>
                  <p className="text-white/40 text-xs mt-2">{c.createdAt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

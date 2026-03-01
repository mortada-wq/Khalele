"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2, MapPin } from "lucide-react";

export default function AdminLexiconsPage() {
  const [lexicons, setLexicons] = useState([
    { grapheme: "شلونك", phoneme: "ʃloːnak", region: "gulf" },
    { grapheme: "وين", phoneme: "weːn", region: "gulf" },
  ]);

  return (
    <main className="min-h-screen p-8" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — معاجم النطق
        </Link>
        <Link href="/admin" className="text-white/80 hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Volume2 size={22} />
          Amazon Polly Lexicons (W3C PLS)
        </h2>
        <p className="text-white/60 text-sm mb-6">
          ربط الكلمات العربية بأصوات IPA الدقيقة
        </p>
        <div className="space-y-4">
          {lexicons.map((l, i) => (
            <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-white/5">
              <span className="font-bold text-kheleel-gold w-24">{l.grapheme}</span>
              <span className="text-white/70 font-mono text-sm">{l.phoneme}</span>
              <span className="text-white/40 text-sm flex items-center gap-1">
                <MapPin size={14} />
                {l.region}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 rounded-lg bg-kheleel-gold/20 text-kheleel-gold hover:bg-kheleel-gold/30 transition-colors">
          إضافة كلمة
        </button>
      </section>

      <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold mb-4">لهجات عربية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-white/10">
            <p className="font-bold">خليجي</p>
            <p className="text-white/50 text-sm">دول الخليج</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10">
            <p className="font-bold">مصري</p>
            <p className="text-white/50 text-sm">مصر</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10">
            <p className="font-bold">شامي</p>
            <p className="text-white/50 text-sm">سوريا، لبنان، الأردن، فلسطين</p>
          </div>
        </div>
      </section>
    </main>
  );
}

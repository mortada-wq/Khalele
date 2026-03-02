"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Volume2, MapPin } from "lucide-react";

export default function AdminLexiconsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  const [lexicons] = useState([
    { grapheme: "شلونك", phoneme: "ʃloːnak", region: "gulf" },
    { grapheme: "وين", phoneme: "weːn", region: "gulf" },
  ]);

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — معاجم النطق
        </Link>
        <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5] mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#000000" }}>
          <Volume2 size={22} />
          Amazon Polly Lexicons (W3C PLS)
        </h2>
        <p className="text-[#8c8c8c] text-sm mb-6">
          ربط الكلمات العربية بأصوات IPA الدقيقة
        </p>
        <div className="space-y-4">
          {lexicons.map((l, i) => (
            <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-[#fafafa]">
              <span className="font-bold text-kheleel-gold w-24">{l.grapheme}</span>
              <span className="text-[#231f20] font-mono text-sm">{l.phoneme}</span>
              <span className="text-[#8c8c8c] text-sm flex items-center gap-1">
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

      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#000000" }}>لهجات عربية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-[#e5e5e5]">
            <p className="font-bold" style={{ color: "#000000" }}>خليجي</p>
            <p className="text-[#8c8c8c] text-sm">دول الخليج</p>
          </div>
          <div className="p-4 rounded-xl border border-[#e5e5e5]">
            <p className="font-bold" style={{ color: "#000000" }}>مصري</p>
            <p className="text-[#8c8c8c] text-sm">مصر</p>
          </div>
          <div className="p-4 rounded-xl border border-[#e5e5e5]">
            <p className="font-bold" style={{ color: "#000000" }}>شامي</p>
            <p className="text-[#8c8c8c] text-sm">سوريا، لبنان، الأردن، فلسطين</p>
          </div>
        </div>
      </section>
    </main>
  );
}

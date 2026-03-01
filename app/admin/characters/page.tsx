"use client";

import Link from "next/link";
import { DEFAULT_CHARACTERS } from "@/lib/characters";

export default function AdminCharactersPage() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — إدارة الشخصيات
        </Link>
        <Link href="/admin" className="text-white/80 hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEFAULT_CHARACTERS.map((c) => (
          <Link
            key={c.id}
            href={`/admin/characters/${c.id}`}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors block"
          >
            <h3 className="text-xl font-bold text-kheleel-gold mb-2">{c.nameAr}</h3>
            <p className="text-white/80 mb-2">{c.name}</p>
            <p className="text-white/60 text-sm mb-4">{c.description}</p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-white/10">{c.region}</span>
              <span className="px-2 py-1 rounded bg-white/10">{c.languageStyle}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-white/40 text-sm">
        إضافة شخصيات جديدة وتخصيص الصوت والمعتقدات قريباً.
      </p>
    </main>
  );
}

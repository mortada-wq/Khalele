"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DEFAULT_CHARACTERS } from "@/lib/characters";

export default function CharacterDesignerPage() {
  const params = useParams();
  const id = params?.id as string;
  const character = DEFAULT_CHARACTERS.find((c) => c.id === id) ?? DEFAULT_CHARACTERS[0];
  const [dialectIntensity, setDialectIntensity] = useState(70);
  const [politicalViews, setPoliticalViews] = useState(50);
  const [religiousViews, setReligiousViews] = useState(70);
  const [formality, setFormality] = useState(50);

  return (
    <main className="min-h-screen p-8" dir="rtl">
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin/characters" className="text-kheleel-gold font-bold text-2xl">
          خليلي — مصمم الشخصيات
        </Link>
        <Link href="/admin/characters" className="text-white/80 hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <div className="max-w-2xl space-y-8">
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-lg font-bold mb-4">{character.nameAr}</h2>
          <p className="text-white/60 text-sm mb-6">{character.description}</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">شدة اللهجة (دارج ← أصيل)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={dialectIntensity}
                onChange={(e) => setDialectIntensity(Number(e.target.value))}
                className="w-full accent-kheleel-gold"
              />
              <p className="text-white/40 text-xs mt-1">{dialectIntensity}%</p>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">المحافظة ← الليبرالية</label>
              <input
                type="range"
                min="0"
                max="100"
                value={politicalViews}
                onChange={(e) => setPoliticalViews(Number(e.target.value))}
                className="w-full accent-kheleel-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">التديّن (علماني ← متديّن)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={religiousViews}
                onChange={(e) => setReligiousViews(Number(e.target.value))}
                className="w-full accent-kheleel-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">الرسمية (عامي ← رسمي)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formality}
                onChange={(e) => setFormality(Number(e.target.value))}
                className="w-full accent-kheleel-gold"
              />
            </div>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold mb-4">مطابقة الصوت</h3>
          <p className="text-white/60 text-sm mb-4">
            Amazon Polly Custom Voices — صوت يطابق العمر والمنطقة
          </p>
          <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <option>Zeina (عربي)</option>
            <option>Zayd (عربي)</option>
          </select>
        </section>
      </div>
    </main>
  );
}

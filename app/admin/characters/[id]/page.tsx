"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DEFAULT_CHARACTERS } from "@/lib/characters";

export default function CharacterDesignerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);
  const id = params?.id as string;
  const character = DEFAULT_CHARACTERS.find((c) => c.id === id) ?? DEFAULT_CHARACTERS[0];
  const [dialectIntensity, setDialectIntensity] = useState(70);
  const [politicalViews, setPoliticalViews] = useState(50);
  const [religiousViews, setReligiousViews] = useState(70);
  const [formality, setFormality] = useState(50);

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin/characters" className="text-kheleel-gold font-bold text-2xl">
          خليل — مصمم الشخصيات
        </Link>
        <Link href="/admin/characters" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <div className="max-w-2xl space-y-8">
        <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#000000" }}>{character.nameAr}</h2>
          <p className="text-[#8c8c8c] text-sm mb-6">{character.description}</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#231f20] mb-2">شدة اللهجة (دارج ← أصيل)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={dialectIntensity}
                onChange={(e) => setDialectIntensity(Number(e.target.value))}
                className="w-full accent-kheleel-gold"
              />
              <p className="text-[#8c8c8c] text-xs mt-1">{dialectIntensity}%</p>
            </div>

            <div>
              <label className="block text-sm text-[#231f20] mb-2">المحافظة ← الليبرالية</label>
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
              <label className="block text-sm text-[#231f20] mb-2">التديّن (علماني ← متديّن)</label>
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
              <label className="block text-sm text-[#231f20] mb-2">الرسمية (عامي ← رسمي)</label>
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

        <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-bold mb-4" style={{ color: "#000000" }}>مطابقة الصوت</h3>
          <p className="text-[#8c8c8c] text-sm mb-4">
            Amazon Polly Custom Voices — صوت يطابق العمر والمنطقة
          </p>
          <select className="px-4 py-2 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
            <option>ar-XA-Wavenet-A (نورا)</option>
            <option>Zayd (عربي)</option>
          </select>
        </section>
      </div>
    </main>
  );
}

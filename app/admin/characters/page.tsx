"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DEFAULT_CHARACTERS } from "@/lib/characters";

export default function AdminCharactersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  return (
    <main className="min-h-screen p-8" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — إدارة الشخصيات
        </Link>
        <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEFAULT_CHARACTERS.map((c) => (
          <Link
            key={c.id}
            href={`/admin/characters/${c.id}`}
            className="p-6 rounded-2xl bg-white border border-[#e5e5e5] hover:bg-[#f0f0f0] transition-colors block"
          >
            <h3 className="text-xl font-bold text-kheleel-gold mb-2">{c.nameAr}</h3>
            <p className="text-[#000000] mb-2">{c.name}</p>
            <p className="text-[#8c8c8c] text-sm mb-4">{c.description}</p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-[#f0f0f0]">{c.region}</span>
              <span className="px-2 py-1 rounded bg-[#f0f0f0]">{c.languageStyle}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-[#8c8c8c] text-sm">
        إضافة شخصيات جديدة وتخصيص الصوت والمعتقدات قريباً.
      </p>
    </main>
  );
}

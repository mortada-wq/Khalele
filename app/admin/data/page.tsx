"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, FileText, Music, BookOpen, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploadType, setUploadType] = useState<"training" | "media" | "heritage">("training");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user?.role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#ebebec" }}>
        <span className="font-ui" style={{ color: "#8c8c8c" }}>جاري التحميل...</span>
      </div>
    );
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files.length) return;
    setResult(null);
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("uploadType", uploadType);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.details || "Upload failed");
      }
      setResult({ ok: true, msg: `تم رفع ${files.length} ملف بنجاح` });
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "فشل الرفع" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setResult(null);
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("uploadType", uploadType);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.details || "Upload failed");
      }
      setResult({ ok: true, msg: `تم رفع ${files.length} ملف بنجاح` });
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "فشل الرفع" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <main className="min-h-screen p-8" dir="rtl" style={{ background: "#ebebec" }}>
      <header className="flex items-center justify-between mb-12">
        <Link href="/admin" className="text-kheleel-gold font-bold text-2xl">
          خليلي — استخراج البيانات
        </Link>
        <Link href="/admin" className="text-[#000000] hover:text-kheleel-gold">
          العودة
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          onClick={() => setUploadType("training")}
          className={`p-6 rounded-2xl border transition-colors text-right ${
            uploadType === "training"
              ? "bg-kheleel-gold/20 border-kheleel-gold/40"
              : "bg-white border-[#e5e5e5] hover:bg-[#f0f0f0]"
          }`}
        >
          <FileText className="w-10 h-10 text-kheleel-gold mb-4" />
          <h3 className="text-lg font-bold mb-2" style={{ color: "#000000" }}>بيانات التدريب</h3>
          <p className="text-[#8c8c8c] text-sm">محادثات المتطوعين، JSONL</p>
        </button>
        <button
          onClick={() => setUploadType("media")}
          className={`p-6 rounded-2xl border transition-colors text-right ${
            uploadType === "media"
              ? "bg-kheleel-gold/20 border-kheleel-gold/40"
              : "bg-white border-[#e5e5e5] hover:bg-[#f0f0f0]"
          }`}
        >
          <Music className="w-10 h-10 text-kheleel-gold mb-4" />
          <h3 className="text-lg font-bold mb-2" style={{ color: "#000000" }}>الميديا</h3>
          <p className="text-[#8c8c8c] text-sm">تلفزيون، راديو، بودكاست</p>
        </button>
        <button
          onClick={() => setUploadType("heritage")}
          className={`p-6 rounded-2xl border transition-colors text-right ${
            uploadType === "heritage"
              ? "bg-kheleel-gold/20 border-kheleel-gold/40"
              : "bg-white border-[#e5e5e5] hover:bg-[#f0f0f0]"
          }`}
        >
          <BookOpen className="w-10 h-10 text-kheleel-gold mb-4" />
          <h3 className="text-lg font-bold mb-2" style={{ color: "#000000" }}>التراث اللغوي</h3>
          <p className="text-[#8c8c8c] text-sm">مخطوطات، كتب اللهجات</p>
        </button>
      </div>

      <section className="p-6 rounded-2xl bg-white border border-[#e5e5e5]">
        <h2 className="text-xl font-bold mb-4" style={{ color: "#000000" }}>رفع الملفات إلى S3</h2>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-12 text-center hover:border-kheleel-gold/40 transition-colors cursor-pointer"
        >
          <input
            type="file"
            multiple
            accept={
              uploadType === "training"
                ? ".jsonl,.json,.csv"
                : uploadType === "media"
                  ? "audio/*,video/*,.mp4,.mp3,.wav"
                  : ".pdf,.tiff,.tif"
            }
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-16 h-16 text-[#8c8c8c] mx-auto mb-4" />
            <p className="text-[#231f20] mb-2">
              {uploading ? "جاري الرفع..." : "اسحب الملفات هنا أو انقر للاختيار"}
            </p>
            <p className="text-[#8c8c8c] text-sm">
              {uploadType === "training" && "JSONL, CSV — أزواج prompt/completion"}
              {uploadType === "media" && "MP4, MP3, WAV — للنسخ عبر Transcribe"}
              {uploadType === "heritage" && "PDF, TIFF — للاستخراج عبر Textract/Bedrock"}
            </p>
          </label>
        </div>
        {result && (
          <div
            className={`mt-4 flex items-center gap-2 p-3 rounded-lg ${
              result.ok ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
            }`}
          >
            {result.ok ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{result.msg}</span>
          </div>
        )}
        <p className="mt-4 text-[#8c8c8c] text-sm">
          التخزين: s3://khalele-training-data/
        </p>
      </section>
    </main>
  );
}

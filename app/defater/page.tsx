"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotebookEditor } from "@/components/Notebook/NotebookEditor";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { getOrCreateUserId } from "@/lib/chat";

const STORAGE_KEY = "kheleel_defater_content";
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export default function DefaterPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [notebooks, setNotebooks] = useState<{ id: string; name: string }[]>([]);
  const [studies, setStudies] = useState<{ id: string; title: string; createdAt: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const insertTextRef = useRef<((text: string) => void) | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isListening: _isListening, toggle, error, isSupported } = useSpeechRecognition({
    lang: "ar-SA",
    onResult: (transcript) => {
      insertTextRef.current?.(transcript + " ");
    },
    onError: (msg) => showToast(msg),
  });

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const bytes = new TextEncoder().encode(saved).length;
        if (bytes <= MAX_SIZE_BYTES) setContent(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  // Debounced save to localStorage
  const saveToStorage = useCallback((value: string) => {
    const bytes = new TextEncoder().encode(value).length;
    if (bytes > MAX_SIZE_BYTES) return;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      showToast("تجاوز الحد المسموح (20 ميجابايت)");
    }
  }, [showToast]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveToStorage(newContent), 500);
    },
    [saveToStorage]
  );

  // Commented out - not currently used but may be needed later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopy = useCallback(() => {
    if (!content) {
      showToast("لا يوجد نص للنسخ");
      return;
    }
    navigator.clipboard.writeText(content).then(
      () => showToast("تم النسخ"),
      () => showToast("فشل النسخ")
    );
  }, [content, showToast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const combined = content + text;
        const bytes = new TextEncoder().encode(combined).length;
        if (bytes > MAX_SIZE_BYTES) {
          showToast("تجاوز الحد المسموح (20 ميجابايت)");
          return;
        }
        handleContentChange(combined);
        showToast("تم اللصق");
      }
    } catch {
      showToast("فشل القراءة من الحافظة");
    }
  }, [content, handleContentChange, showToast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleShare = useCallback(() => {
    if (!content) {
      showToast("لا يوجد محتوى للمشاركة");
      return;
    }
    if (navigator.share) {
      navigator
        .share({ title: "دفتر خليل", text: content })
        .then(() => showToast("تمت المشاركة"))
        .catch(() => showToast("فشلت المشاركة"));
    } else {
      navigator.clipboard.writeText(content).then(
        () => showToast("تم النسخ للحافظة"),
        () => showToast("فشل النسخ")
      );
    }
  }, [content, showToast]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExport = useCallback(
    (action: "google-doc" | "chat" | "case") => {
      if (!content) {
        showToast("لا يوجد محتوى للتصدير");
        return;
      }
      if (action === "google-doc") {
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `دفتر-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("تم تحميل الملف");
      } else if (action === "chat") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("kheleel_import_from_notebook", content);
        }
        router.push("/chat");
        showToast("جاري فتح المحادثة...");
      } else if (action === "case") {
        const title = `قضية من الدفتر ${new Date().toLocaleDateString("ar-SA")}`;
        fetch("/api/studies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": getOrCreateUserId(),
          },
          body: JSON.stringify({ title, content }),
        })
          .then(async (r) => {
            const d = (await r.json()) as { study?: { id: string }; error?: string };
            if (r.ok && d?.study?.id) {
              showToast("تم حفظ القضية");
              router.push("/chat");
            } else {
              showToast(d?.error ?? "فشل حفظ القضية");
            }
          })
          .catch(() => showToast("فشل حفظ القضية"));
      }
    },
    [content, router, showToast]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMic = useCallback(() => {
    if (!isSupported) {
      showToast("الكتابة الصوتية غير مدعومة في هذا المتصفح");
      return;
    }
    if (error) showToast(error);
    toggle();
  }, [isSupported, error, toggle, showToast]);

  useEffect(() => {
    if (error) showToast(error);
  }, [error, showToast]);

  // Fetch notebooks and studies for sidebar
  useEffect(() => {
    let cancelled = false;
    const headers = { "x-user-id": getOrCreateUserId() };
    Promise.all([
      fetch("/api/notebooks?limit=50", { headers }),
      fetch("/api/studies?limit=50", { headers }),
    ]).then(([nbRes, stRes]) => {
      if (cancelled) return;
      nbRes.json().then((d: { notebooks?: { id: string; title: string; content: string; updatedAt: string }[] }) => {
        if (!cancelled && d.notebooks) {
          setNotebooks(
            d.notebooks.map((n) => ({
              id: n.id,
              name: n.title,
              preview: n.content?.split("\n")[0]?.trim().slice(0, 40) || undefined,
              createdAt: n.updatedAt,
            }))
          );
        }
      });
      stRes.json().then((d: { studies?: { id: string; title: string; createdAt: string }[] }) => {
        if (!cancelled && d.studies) {
          setStudies(d.studies.map((s) => ({ id: s.id, title: s.title, createdAt: s.createdAt })));
        }
      });
    });
    return () => { cancelled = true; };
  }, []);

  const handleSelectNotebook = (nid: string) => router.push(`/notebooks/${nid}`);
  const handleCreateNotebook = () => {
    fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": getOrCreateUserId() },
      body: JSON.stringify({ title: "دفتر جديد" }),
    })
      .then((r) => r.json())
      .then((d: { notebook?: { id: string } }) => {
        if (d?.notebook?.id) router.push(`/notebooks/${d.notebook.id}`);
      })
      .catch(() => showToast("فشل إنشاء الدفتر"));
  };
  const handleOpenDefater = () => router.push("/defater");

  return (
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl" style={{ background: "var(--bg-tertiary)" }}>
      <TopBar
        onAvatarClick={() => router.push("/chat")}
        onShare={handleShare}
        onReport={() => {}}
        showChatActions={false}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          onCreateDiwan={() => router.push("/chat")}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <NotebookEditor
            value={content}
            onChange={handleContentChange}
          />
        </main>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg font-ui text-sm z-50"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            border: "var(--border-subtle)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

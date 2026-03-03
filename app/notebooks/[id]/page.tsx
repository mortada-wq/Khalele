"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { NotebookEditor } from "@/components/Notebook/NotebookEditor";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { getOrCreateUserId, groupConversationsByDate } from "@/lib/chat";
import type { Report, Project, Study } from "@/components/Sidebar";

interface NotebookRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const API_HEADERS = () => ({
  "Content-Type": "application/json",
  "x-user-id": getOrCreateUserId(),
});

export default function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [notebook, setNotebook] = useState<NotebookRecord | null>(null);
  const [content, setContent] = useState("");
  const [notebooks, setNotebooks] = useState<Project[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchNotebook = useCallback(async () => {
    try {
      const res = await fetch(`/api/notebooks/${id}`, { headers: API_HEADERS() });
      if (!res.ok) {
        if (res.status === 404) {
          showToast("الدفتر غير موجود");
          router.replace("/chat");
          return;
        }
        throw new Error("Failed to load");
      }
      const data = (await res.json()) as { notebook: NotebookRecord };
      setNotebook(data.notebook);
      setContent(data.notebook.content);
    } catch {
      showToast("فشل تحميل الدفتر");
      router.replace("/chat");
    } finally {
      setLoading(false);
    }
  }, [id, router, showToast]);

  const fetchNotebooks = useCallback(async () => {
    try {
      const res = await fetch("/api/notebooks?limit=50", { headers: API_HEADERS() });
      if (!res.ok) return;
      const data = (await res.json()) as { notebooks: NotebookRecord[] };
      setNotebooks(
        (data.notebooks ?? []).map((n) => ({
          id: n.id,
          name: n.title,
          preview: n.content.split("\n")[0]?.trim().slice(0, 40) || undefined,
          createdAt: n.updatedAt,
        }))
      );
    } catch {
      // Ignore
    }
  }, []);

  const fetchStudies = useCallback(async () => {
    try {
      const res = await fetch("/api/studies?limit=50", { headers: API_HEADERS() });
      if (!res.ok) return;
      const data = (await res.json()) as { studies: { id: string; title: string; createdAt: string }[] };
      setStudies(data.studies ?? []);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchNotebook();
    fetchNotebooks();
    fetchStudies();
  }, [fetchNotebook, fetchNotebooks, fetchStudies]);

  const saveContent = useCallback(
    async (newContent: string) => {
      if (!id) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/notebooks/${id}`, {
          method: "PUT",
          headers: API_HEADERS(),
          body: JSON.stringify({ content: newContent }),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = (await res.json()) as { notebook: NotebookRecord };
        setNotebook(data.notebook);
      } catch {
        showToast("فشل الحفظ");
      } finally {
        setSaving(false);
      }
    },
    [id, showToast]
  );

  const debouncedSave = useCallback(
    (newContent: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveContent(newContent), 800);
    },
    [saveContent]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      debouncedSave(newContent);
    },
    [debouncedSave]
  );

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

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) handleContentChange(content + text);
    } catch {
      showToast("فشل القراءة من الحافظة");
    }
  }, [content, handleContentChange, showToast]);

  const handleShare = useCallback(() => {
    if (!content) {
      showToast("لا يوجد محتوى للمشاركة");
      return;
    }
    if (navigator.share) {
      navigator
        .share({
          title: notebook?.title ?? "دفتر",
          text: content,
        })
        .then(() => showToast("تمت المشاركة"))
        .catch(() => showToast("فشلت المشاركة"));
    } else {
      navigator.clipboard.writeText(content).then(
        () => showToast("تم نسخ الرابط للحافظة"),
        () => showToast("فشل النسخ")
      );
    }
  }, [content, notebook?.title, showToast]);

  const handleExport = useCallback(
    async (action: "google-doc" | "chat" | "case") => {
      if (!content) {
        showToast("لا يوجد محتوى للتصدير");
        return;
      }
      if (action === "google-doc") {
        navigator.clipboard.writeText(content).then(
          () => showToast("تم النسخ — الصق في Google Doc"),
          () => showToast("فشل النسخ")
        );
      } else if (action === "chat") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("khalele_import_from_notebook", content);
        }
        router.push("/chat");
        showToast("جاري فتح المحادثة...");
      } else if (action === "case") {
        const title = notebook?.title ?? `دفتر ${new Date().toLocaleDateString("ar-SA")}`;
        try {
          const res = await fetch("/api/studies", {
            method: "POST",
            headers: API_HEADERS(),
            body: JSON.stringify({ title, content }),
          });
          const data = (await res.json()) as { study?: { id: string } };
          if (res.ok && data?.study?.id) {
            showToast("تم حفظ القضية");
            router.push("/chat");
          } else {
            showToast("فشل حفظ القضية");
          }
        } catch {
          showToast("فشل حفظ القضية");
        }
      }
    },
    [content, notebook?.title, router, showToast]
  );

  const handleMic = useCallback(() => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        chunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunksRef.current.length === 0) {
            setIsRecording(false);
            showToast("لم يتم تسجيل صوت");
            return;
          }
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");
          try {
            const res = await fetch("/api/stt", { method: "POST", body: formData });
            const data = (await res.json()) as { text?: string; error?: string };
            if (!res.ok) {
              showToast(data.error ?? "فشل التحويل الصوتي");
              return;
            }
            const text = (data.text ?? "").trim();
            if (text) {
              handleContentChange(content + (content ? "\n" : "") + text);
              showToast("تم إدراج النص");
            } else {
              showToast("لم يتم التعرف على نص");
            }
          } catch {
            showToast("فشل إرسال التسجيل");
          } finally {
            setIsRecording(false);
          }
        };
        mr.start();
        setIsRecording(true);
      })
      .catch(() => showToast("فشل الوصول للميكروفون"));
  }, [isRecording, content, handleContentChange, showToast]);

  const handleSelectNotebook = (nid: string) => {
    if (nid !== id) router.push(`/notebooks/${nid}`);
  };

  const handleCreateNotebook = () => {
    fetch("/api/notebooks", {
      method: "POST",
      headers: API_HEADERS(),
      body: JSON.stringify({ title: "دفتر جديد" }),
    })
      .then((r) => r.json())
      .then((d: { notebook?: { id: string } }) => {
        if (d?.notebook?.id) router.push(`/notebooks/${d.notebook.id}`);
      })
      .catch(() => showToast("فشل إنشاء الدفتر"));
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-tertiary)" }}
        dir="rtl"
      >
        <span style={{ color: "var(--text-tertiary)" }}>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl" style={{ background: "var(--bg-tertiary)" }}>
      <TopBar
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((p) => !p)}
        onAvatarClick={() => router.push("/chat")}
        onShare={handleShare}
        onReport={() => {}}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <Sidebar
          expanded={sidebarExpanded}
          onClose={() => setSidebarExpanded(false)}
          conversations={[]}
          currentConversationId={null}
          groupedConversations={groupConversationsByDate([])}
          reports={[]}
          projects={notebooks}
          studies={studies}
          stealthMode={false}
          onStealthChange={() => {}}
          onSelectConversation={() => {}}
          onSelectProject={handleSelectNotebook}
          onCreateProject={handleCreateNotebook}
          onOpenDefater={() => router.push("/defater")}
          onRenameProject={async (nid, name) => {
            try {
              await fetch(`/api/notebooks/${nid}`, {
                method: "PUT",
                headers: API_HEADERS(),
                body: JSON.stringify({ title: name }),
              });
              setNotebooks((prev) => prev.map((n) => (n.id === nid ? { ...n, name } : n)));
              if (nid === id) setNotebook((prev) => (prev ? { ...prev, title: name } : prev));
            } catch { showToast("فشل تحديث العنوان"); }
          }}
          onSelectStudy={() => router.push("/chat")}
          onRenameStudy={async (sid, title) => {
            try {
              const res = await fetch(`/api/studies/${sid}`, {
                method: "PUT",
                headers: API_HEADERS(),
                body: JSON.stringify({ title }),
              });
              if (res.ok) setStudies((prev) => prev.map((s) => (s.id === sid ? { ...s, title } : s)));
            } catch { showToast("فشل تحديث القضية"); }
          }}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <NotebookEditor
            value={content}
            onChange={handleContentChange}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onShare={handleShare}
            onExport={handleExport}
            onMic={handleMic}
            isRecording={isRecording}
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

      {saving && (
        <div
          className="fixed top-14 right-4 px-3 py-1 rounded-lg font-ui text-xs"
          style={{ background: "var(--color-accent-tint-20)", color: "var(--text-primary)" }}
        >
          جاري الحفظ...
        </div>
      )}
    </div>
  );
}

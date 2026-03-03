"use client";

import { Save, Copy, Trash2 } from "lucide-react";

interface NotebookToolbarProps {
  onSave: () => void;
  onClear: () => void;
  onCopy: () => void;
  isSaving?: boolean;
}

export function NotebookToolbar({
  onSave,
  onClear,
  onCopy,
  isSaving = false,
}: NotebookToolbarProps) {
  return (
    <div className="flex gap-2 p-4 border-b" style={{ borderColor: "#e5e5e5" }} dir="rtl">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 transition-colors"
        style={{ background: "var(--color-accent)" }}
        title="حفظ"
      >
        <Save size={18} />
        حفظ
      </button>
      <button
        onClick={onCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
        style={{ background: "#f0f0f0", color: "#333" }}
        title="نسخ"
      >
        <Copy size={18} />
        نسخ
      </button>
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ml-auto"
        style={{ background: "#fee2e2", color: "#991b1b" }}
        title="حذف"
      >
        <Trash2 size={18} />
        حذف
      </button>
    </div>
  );
}

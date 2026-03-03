"use client";

import React, { useState } from "react";
import { Copy, ClipboardPaste, Share2, Download, Mic } from "lucide-react";

export interface NotebookToolbarProps {
  onCopy: () => void;
  onPaste: () => void;
  onShare: () => void;
  onExport: (action: "google-doc" | "chat" | "case") => void;
  onMic: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

export function NotebookToolbar({
  onCopy,
  onPaste,
  onShare,
  onExport,
  onMic,
  isRecording,
  disabled,
}: NotebookToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-2 shrink-0"
      style={{
        background: "rgba(255, 248, 220, 0.95)",
        borderBottom: "2px solid #c4b896",
        borderTop: "2px solid #c0392b",
      }}
    >
      <ToolbarBtn
        icon={<Copy size={18} />}
        label="نسخ"
        onClick={onCopy}
        disabled={disabled}
      />
      <ToolbarBtn
        icon={<ClipboardPaste size={18} />}
        label="لصق"
        onClick={onPaste}
        disabled={disabled}
      />
      <ToolbarBtn
        icon={<Share2 size={18} />}
        label="مشاركة"
        onClick={onShare}
        disabled={disabled}
      />
      <ExportMenu onExport={onExport} disabled={disabled} />
      <div className="flex-1" />
      <ToolbarBtn
        icon={<Mic size={18} />}
        label={isRecording ? "جارٍ التسجيل..." : "كتابة صوتية"}
        onClick={onMic}
        disabled={disabled}
        active={isRecording}
      />
    </div>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-ui text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        color: active ? "#c0392b" : "var(--text-secondary)",
        background: active ? "rgba(192, 57, 43, 0.12)" : "transparent",
      }}
      aria-label={label}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ExportMenu({
  onExport,
  disabled,
}: {
  onExport: (a: "google-doc" | "chat" | "case") => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-ui text-sm transition-colors disabled:opacity-50"
        style={{ color: "var(--text-secondary)" }}
        aria-label="تصدير"
        title="تصدير"
      >
        <Download size={18} />
        <span>تصدير</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute top-full right-0 mt-1 py-1 rounded-xl shadow-lg z-20 min-w-[160px]"
            style={{
              background: "var(--bg-primary)",
              border: "var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                onExport("google-doc");
                setOpen(false);
              }}
              className="w-full text-right px-3 py-2 font-ui text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              تصدير إلى Google Doc
            </button>
            <button
              type="button"
              onClick={() => {
                onExport("chat");
                setOpen(false);
              }}
              className="w-full text-right px-3 py-2 font-ui text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              تصدير إلى المحادثة
            </button>
            <button
              type="button"
              onClick={() => {
                onExport("case");
                setOpen(false);
              }}
              className="w-full text-right px-3 py-2 font-ui text-sm hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              تصدير كقضية
            </button>
          </div>
        </>
      )}
    </div>
  );
}

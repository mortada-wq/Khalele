"use client";

import { useCallback, useRef, useEffect } from "react";
import { NotebookToolbar } from "./NotebookToolbar";

const LINE_HEIGHT = 32;
const NOTEBOOK_BG = "#fef9e7"; // soft yellow (old paper)
const LINE_COLOR = "#b8d4e3"; // light blue
const TOP_LINE_COLOR = "#c0392b"; // red
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export interface NotebookEditorProps {
  value: string;
  onChange: (content: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  onShare: () => void;
  onExport: (action: "google-doc" | "chat" | "case") => void;
  onMic: () => void;
  isRecording: boolean;
  placeholder?: string;
}

export function NotebookEditor({
  value,
  onChange,
  onCopy,
  onPaste,
  onShare,
  onExport,
  onMic,
  isRecording,
  placeholder = "ابدأ الكتابة...",
}: NotebookEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      const bytes = new TextEncoder().encode(v).length;
      if (bytes <= MAX_SIZE_BYTES) onChange(v);
    },
    [onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text");
      if (!pasted) return;
      const combined = value + pasted;
      const bytes = new TextEncoder().encode(combined).length;
      if (bytes > MAX_SIZE_BYTES) {
        e.preventDefault();
      }
    },
    [value]
  );

  useEffect(() => {
    if (!textareaRef.current || !containerRef.current) return;
    const ta = textareaRef.current;
    const minHeight = containerRef.current.clientHeight - 48;
    ta.style.minHeight = `${Math.max(400, minHeight)}px`;
  }, []);

  const lines = Math.max(20, Math.ceil((value.split("\n").length || 1) * 1.5));

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full overflow-hidden"
      dir="rtl"
    >
      <NotebookToolbar
        onCopy={onCopy}
        onPaste={onPaste}
        onShare={onShare}
        onExport={onExport}
        onMic={onMic}
        isRecording={isRecording}
      />

      <div
        className="flex-1 overflow-auto px-6 md:px-12 py-6"
        style={{
          background: NOTEBOOK_BG,
          backgroundImage: `
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent ${LINE_HEIGHT - 1}px,
              ${LINE_COLOR} ${LINE_HEIGHT - 1}px,
              ${LINE_COLOR} ${LINE_HEIGHT}px
            )
          `,
          backgroundPosition: "0 0",
        }}
      >
        {/* Red top margin line */}
        <div
          className="h-0.5 mb-2"
          style={{ background: TOP_LINE_COLOR }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full resize-none border-0 outline-none bg-transparent font-[var(--font-ui)] text-base leading-[32px]"
          style={{
            color: "var(--text-primary)",
            lineHeight: `${LINE_HEIGHT}px`,
            minHeight: `${lines * LINE_HEIGHT}px`,
          }}
          spellCheck
          dir="rtl"
        />
      </div>
    </div>
  );
}

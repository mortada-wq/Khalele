"use client";

import { useEffect, useRef } from "react";

interface NotebookEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertText?: (insertFn: (text: string) => void) => void;
  placeholder?: string;
}

export function NotebookEditor({
  value,
  onChange,
  onInsertText,
  placeholder = "اكتب ملاحظاتك هنا...",
}: NotebookEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (onInsertText) {
      // توفير دالة لإدراج نصوص من الخارج
      const insertText = (text: string) => {
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const newValue = value.slice(0, start) + text + value.slice(end);
          onChange(newValue);
          
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length;
              textareaRef.current.focus();
            }
          }, 0);
        }
      };
      onInsertText?.(insertText);
    }
  }, [value, onChange, onInsertText]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full p-4 rounded-lg border resize-none focus:outline-none focus:ring-2"
      style={{
        borderColor: "#e5e5e5",
        "--tw-ring-color": "var(--color-accent)",
        direction: "rtl",
        fontFamily: "inherit",
      } as React.CSSProperties}
      dir="rtl"
    />
  );
}

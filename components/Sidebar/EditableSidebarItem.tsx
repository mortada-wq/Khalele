"use client";

import { useState, useRef, useEffect } from "react";

interface EditableSidebarItemProps {
  id: string;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  onSelect: () => void;
  onRename?: (id: string, newTitle: string) => void;
  canEdit?: boolean;
  actions?: React.ReactNode;
}

export function EditableSidebarItem({
  id,
  title,
  subtitle,
  isSelected,
  onSelect,
  onRename,
  canEdit = true,
  actions,
}: EditableSidebarItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, title]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title && onRename) {
      onRename(id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-lg"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 px-2 py-1 rounded text-xs font-ui outline-none"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--color-accent)",
            color: "var(--text-primary)",
          }}
          dir="rtl"
        />
        <button
          type="button"
          onClick={handleSave}
          className="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: "var(--color-accent)" }}
          title="حفظ"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <button
        onClick={onSelect}
        className="flex-1 min-w-0 text-right px-3 py-2 rounded-lg font-ui text-xs truncate block transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        style={{
          color: isSelected ? "var(--color-accent)" : "var(--text-primary)",
          background: isSelected ? "var(--color-accent-tint-10)" : "transparent",
        }}
      >
        <span className="block truncate">{title || "بدون عنوان"}</span>
        {subtitle && (
          <span
            className="block text-[10px] mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            {subtitle}
          </span>
        )}
      </button>
      {canEdit && onRename && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-60 transition-opacity hover:opacity-100"
          style={{ color: "var(--text-tertiary)" }}
          title="تعديل"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
      {actions}
    </div>
  );
}

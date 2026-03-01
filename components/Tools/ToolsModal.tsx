"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { MaterialSymbol } from "react-material-symbols";
import { ADMIN_TOOLS, getUserTools, addUserTool, removeUserTool, type Tool } from "@/lib/tools";

interface ToolsModalProps {
  open: boolean;
  onClose: () => void;
  onToolsChange?: () => void;
}

export function ToolsModal({ open, onClose, onToolsChange }: ToolsModalProps) {
  const [userToolIds, setUserToolIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) setUserToolIds(getUserTools());
  }, [open]);

  const handleAdd = (toolId: string) => {
    addUserTool(toolId);
    setUserToolIds(getUserTools());
    onToolsChange?.();
  };

  const handleRemove = (toolId: string) => {
    removeUserTool(toolId);
    setUserToolIds(getUserTools());
    onToolsChange?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-lg max-h-[85vh] rounded-2xl overflow-hidden font-ui"
        style={{ background: "#ffffff", color: "#231f20" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e5e5e5" }}>
          <h2 className="text-xl font-semibold">أضف أدواتك</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5" aria-label="إغلاق">
            <MaterialSymbol icon="close" size={20} fill={false} style={{ color: "#5a5a5a" }} />
          </button>
        </div>

        <div className="sidebar-scroll flex-1 overflow-y-auto p-6">
          <p className="text-sm mb-4" style={{ color: "#6b6b6b", lineHeight: 1.6 }}>
            اختر الأدوات التي تريد إضافتها إلى شريط الأدوات. ستظهر تحت قسم أدوات في القائمة.
          </p>
          <div className="space-y-3">
            {ADMIN_TOOLS.map((tool) => {
              const isAdded = userToolIds.includes(tool.id);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isAdded={isAdded}
                  onAdd={() => handleAdd(tool.id)}
                  onRemove={() => handleRemove(tool.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  isAdded,
  onAdd,
  onRemove,
}: {
  tool: Tool;
  isAdded: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors"
      style={{
        borderColor: isAdded ? "var(--color-accent-tint-40)" : "#e5e5e5",
        background: isAdded ? "var(--color-accent-tint-06)" : "#fafafa",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">{tool.label}</p>
        <p className="text-xs mt-0.5" style={{ color: "#6b6b6b", lineHeight: 1.5 }}>
          {tool.definition}
        </p>
      </div>
      <button
        type="button"
        onClick={isAdded ? onRemove : onAdd}
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style={{
          background: isAdded ? "var(--color-accent-tint-20)" : "#e5e5e5",
          color: isAdded ? "var(--color-accent)" : "#5a5a5a",
        }}
        aria-label={isAdded ? "إزالة" : "إضافة"}
      >
        {isAdded ? (
          <span className="text-lg font-bold">−</span>
        ) : (
          <Plus size={18} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Plus, MessageSquare, Settings, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isCollapsed?: boolean;
}

export function Sidebar({
  conversations,
  currentId,
  onNewChat,
  onSelectConversation,
  isCollapsed = false,
}: SidebarProps) {
  if (isCollapsed) {
    return (
      <aside className="w-16 flex flex-col items-center py-4 border-r border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl shrink-0">
        <button
          onClick={onNewChat}
          className="p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-khalele-gold transition-colors"
          title="محادثة جديدة"
        >
          <Plus size={22} />
        </button>
        <div className="flex-1 mt-4 space-y-1">
          {conversations.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`p-3 rounded-xl transition-colors ${
                currentId === c.id ? "bg-khalele-gold/20 text-khalele-gold" : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <MessageSquare size={18} />
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col items-center gap-1">
          <ThemeToggle />
          <Link
            href="/admin"
            className="p-3 rounded-xl text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
            title="لوحة التحكم"
          >
            <LayoutDashboard size={20} />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-xl shrink-0">
      <button
        onClick={onNewChat}
        className="m-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-colors border border-white/5"
      >
        <Plus size={20} />
        <span>محادثة جديدة</span>
      </button>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-white/40 text-xs px-3 mb-2">المحادثات</p>
        {conversations.length === 0 ? (
          <p className="text-white/40 text-sm px-3">لا توجد محادثات</p>
        ) : (
          <div className="space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full text-right px-4 py-3 rounded-xl transition-colors truncate ${
                  currentId === c.id
                    ? "bg-khalele-gold/15 text-khalele-gold border border-khalele-gold/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white/90 border border-transparent"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 space-y-1">
        <div className="px-4 py-2">
          <ThemeToggle />
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <Settings size={18} />
          <span>الإعدادات</span>
        </Link>
      </div>
    </aside>
  );
}

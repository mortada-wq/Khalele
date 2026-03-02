import { Plus } from "lucide-react";
import type { Conversation, DateGroup } from "@/lib/chat";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  groupedConversations: Record<DateGroup, Conversation[]>;
}

const GROUP_LABELS: Record<DateGroup, string> = {
  today: "اليوم",
  yesterday: "أمس",
  last7: "آخر 7 أيام",
  older: "سابق",
};

export function ConversationList({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  groupedConversations,
}: ConversationListProps) {
  const hasAnyConversations = Object.values(groupedConversations).some((group) => group.length > 0);

  return (
    <div className="mt-4 space-y-4">
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm transition-colors hover:bg-black/5"
        style={{ color: "#000000" }}
        aria-label="محادثة جديدة"
      >
        <Plus size={18} style={{ color: "#999" }} />
        <span>محادثة جديدة</span>
      </button>

      {hasAnyConversations ? (
        <div className="space-y-4">
          {(["today", "yesterday", "last7", "older"] as const).map((period) => {
            const convs = groupedConversations[period];
            if (convs.length === 0) return null;

            return (
              <div key={period}>
                {period !== "today" && (
                  <p className="px-4 py-1 font-ui text-xs" style={{ color: "#8c8c8c" }}>
                    {GROUP_LABELS[period]}
                  </p>
                )}
                {convs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className="conversation-item w-full text-right px-4 py-2.5 rounded-lg font-ui text-sm truncate block"
                    style={{
                      color: currentConversationId === c.id ? "var(--color-accent)" : "#000000",
                      background: currentConversationId === c.id ? "var(--color-accent-tint-10)" : "transparent",
                    }}
                  >
                    {c.title || "محادثة جديدة"}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-4 py-2 font-ui text-sm" style={{ color: "#8c8c8c" }}>
          لا توجد محادثات بعد — ابدأ محادثة جديدة!
        </p>
      )}
    </div>
  );
}

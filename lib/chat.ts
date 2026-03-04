export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  characterId?: string;
  factCheckMode?: "off" | "notify" | "notify_with_reason";
  updatedAt: string;
}

export type DateGroup = "today" | "yesterday" | "last7" | "older";

export const USER_ID_KEY = "khalele_user_id";

// REMOVED: Guest/Anonymous user logic
// Users must be authenticated to use the app
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  const id = localStorage.getItem(USER_ID_KEY);
  return id || "";
}

export function groupConversationsByDate(conversations: Conversation[]): Record<DateGroup, Conversation[]> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysStr = sevenDaysAgo.toISOString().slice(0, 10);

  const groups: Record<DateGroup, Conversation[]> = {
    today: [],
    yesterday: [],
    last7: [],
    older: [],
  };

  const sorted = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  for (const c of sorted) {
    const d = c.updatedAt.slice(0, 10);
    if (d === todayStr) groups.today.push(c);
    else if (d === yesterdayStr) groups.yesterday.push(c);
    else if (d >= sevenDaysStr) groups.last7.push(c);
    else groups.older.push(c);
  }

  return groups;
}

/**
 * Kheleel Memory System
 * - Core Memory: User profiles (DynamoDB)
 * - Episodic Memory: Conversation summaries
 * - Semantic Memory: Knowledge nodes (in-memory for now; pgvector in production)
 * - Cross-Character Shared Pool: Facts learned by any character, available to all
 */

export type LanguageStyle = "formal_msa" | "easy_arabic";

export interface MemoryContext {
  userPreferences?: {
    dialectRegion?: string;
    languageStyle?: LanguageStyle;
  };
  recentTopics?: string[];
  conversationSummary?: string;
}

// Dialect terms for understanding user input (Egyptian, Gulf, Levantine, etc.)
const DIALECT_KNOWLEDGE: Record<string, string> = {
  "شلونك": "تحية: كيف حالك",
  "زين": "جيد، بخير",
  "ماشي": "حسناً، موافق",
  "يلا": "هيا، تعال",
  "شكو مكو": "ما المشكلة، ماذا يوجد",
  // Egyptian
  "إزيك": "تحية مصرية: كيف حالك",
  "إيه": "ماذا، أي شيء",
  "تمام": "حسناً، جيد",
  // Gulf
  "شحالك": "تحية خليجية: كيف حالك",
  "طيب": "حسناً، موافق",
  "يالله": "هيا، تعال",
  // Levantine
  "كيفك": "تحية شامية: كيف حالك",
  "منيح": "جيد، بخير",
};

// Cross-character shared knowledge pool (e.g. user's favorite dish, preferences)
const SHARED_KNOWLEDGE: string[] = [];

export function addToSharedKnowledge(fact: string): void {
  if (fact.trim() && !SHARED_KNOWLEDGE.includes(fact.trim())) {
    SHARED_KNOWLEDGE.push(fact.trim());
    if (SHARED_KNOWLEDGE.length > 50) SHARED_KNOWLEDGE.shift();
  }
}

export function getSharedKnowledge(): string[] {
  return [...SHARED_KNOWLEDGE];
}

export function getRelevantKnowledge(query: string): string[] {
  const results: string[] = [];
  const lower = query.toLowerCase();
  for (const [term, def] of Object.entries(DIALECT_KNOWLEDGE)) {
    if (lower.includes(term) || query.includes(term)) {
      results.push(`${term}: ${def}`);
    }
  }
  // Include shared knowledge when relevant
  const shared = getSharedKnowledge();
  if (shared.length > 0) {
    results.push(`Shared context (from previous conversations): ${shared.slice(-5).join("; ")}`);
  }
  return results;
}

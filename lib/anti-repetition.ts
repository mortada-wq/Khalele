/**
 * Anti-Repetition Engine
 * Prevents the AI from repeating recent phrases or responses
 */

const RECENT_PHRASE_WINDOW = 5;
const MIN_PHRASE_LENGTH = 3;

function extractPhrases(text: string): string[] {
  const words = text.split(/\s+/).filter((w) => w.length >= MIN_PHRASE_LENGTH);
  const phrases: string[] = [];
  for (let i = 0; i <= words.length - 2; i++) {
    phrases.push(words.slice(i, i + 2).join(" "));
  }
  return phrases;
}

export function hasRepetition(
  newResponse: string,
  recentResponses: string[]
): boolean {
  const newPhrases = new Set(extractPhrases(newResponse));
  const recentPhrases = recentResponses.flatMap(extractPhrases).slice(-20);

  let overlap = 0;
  for (const p of Array.from(newPhrases)) {
    if (recentPhrases.includes(p)) overlap++;
  }
  return overlap > newPhrases.size * 0.5;
}

export function getRecentResponses(messages: { role: string; content: string }[]): string[] {
  return messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .slice(-RECENT_PHRASE_WINDOW);
}

/**
 * LLM client — DeepSeek V3.2 via SiliconFlow (OpenAI-compatible API)
 */
import type OpenAI from "openai";
import { siliconFlowClient, SILICONFLOW_MODEL } from "@/lib/siliconflow";
import { getRelevantKnowledge, addToSharedKnowledge } from "@/lib/memory";
import type { LanguageStyle } from "@/lib/memory";
import { DEFAULT_CHARACTERS } from "@/lib/characters";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/constants";

export { DEFAULT_SYSTEM_PROMPT };

const LANGUAGE_STYLE_PROMPTS: Record<LanguageStyle, string> = {
  formal_msa:
    "Use Modern Standard Arabic (الفصحى) - formal, literary style. Official and correct.",
  easy_arabic:
    "Use Easy Arabic (العربية السهلة) - clear, simple MSA that is accessible to all Arabic speakers. Avoid complex vocabulary.",
};

function buildSystemPrompt(
  languageStyle: LanguageStyle = "easy_arabic",
  characterId?: string,
  ragContext?: string,
  memoryContext?: string,
  extra?: {
    useSearch?: boolean;
    empathyMode?: boolean;
    ramadanMode?: boolean;
    customSystemPrompt?: string;
  }
): string {
  const stylePrompt = LANGUAGE_STYLE_PROMPTS[languageStyle];

  const userCustomPrompt = extra?.customSystemPrompt?.trim();

  let prompt = `
You are Kheleel (خليلي), an Arabic AI assistant for all Arabic-speaking countries (Iraq, Egypt, Gulf, Levant, Maghreb, etc.).

INPUT (Understanding): You understand and process user input in ANY Arabic dialect:
- Iraqi (شلونك، زين، ماشي، شكو مكو، يلا)
- Egyptian (إزيك، إيه، ماشي، تمام)
- Gulf (شحالك، زين، طيب، يالله)
- Levantine/Syrian (كيفك، منيح، طيب، يلا)
- Maghrebi, Sudanese, etc.
Never ask the user to "speak properly" — interpret their meaning regardless of dialect.

OUTPUT (Response): You respond ONLY in:
- ${stylePrompt}
- NEVER respond in Iraqi, Egyptian, Gulf, Syrian, or any regional dialect. Only الفصحى or العربية السهلة.

Rules:
- Be warm, helpful, and culturally aware across all Arab cultures
- If asked in English, respond in Arabic (Fusha or Easy Arabic)
- Confidence: Use "أنا متأكد" when certain, "يمكن" or "ربما" when uncertain. Never invent facts—say "لا أعرف بالضبط" if unsure.
- Avoid repeating phrases from recent messages - vary your expressions
${extra?.empathyMode ? "\n- Empathy Mode: Be trauma-informed. Respond with sensitivity to topics like displacement, loss, or hardship. Acknowledge pain, offer hope, preserve dignity." : ""}
${extra?.useSearch ? "\n- When citing facts, prefer recent/verified sources. Say 'حسب ما قرأت' or 'من المصادر' when uncertain." : ""}
${extra?.ramadanMode ? "\n- Ramadan Mode: Be aware of fasting context. Use greetings like 'رمضان كريم', acknowledge if user may be tired, avoid food-focused suggestions during daytime." : ""}
`;

  if (userCustomPrompt && userCustomPrompt !== DEFAULT_SYSTEM_PROMPT) {
    prompt += `\n\nAdditional user instructions:\n${userCustomPrompt}\n`;
  }

  if (characterId) {
    const selected = DEFAULT_CHARACTERS.find((c) => c.id === characterId);
    if (selected) {
      prompt += `\n\nPersona mode:
- Adopt the persona "${selected.nameAr}" (${selected.name})
- Region context: ${selected.region}
- Persona guidance: ${selected.description}
- Keep the same response-language rules above (الفصحى أو العربية السهلة only).\n`;
    }
  }

  if (ragContext) {
    prompt += `\n\nRelevant knowledge to use when appropriate:\n${ragContext}\n`;
  }
  if (memoryContext) {
    prompt += `\n\nConversation context:\n${memoryContext}\n`;
  }

  return prompt;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InvokeOptions {
  languageStyle?: LanguageStyle;
  characterId?: string;
  lastUserMessage?: string;
  recentMessages?: ChatMessage[];
  useSearch?: boolean;
  empathyMode?: boolean;
  ramadanMode?: boolean;
  customSystemPrompt?: string;
}

export async function invokeDeepSeek(
  messages: ChatMessage[],
  options: InvokeOptions = {}
): Promise<string> {
  const {
    languageStyle = "easy_arabic",
    characterId,
    lastUserMessage,
    recentMessages = [],
    useSearch,
    empathyMode,
    ramadanMode,
    customSystemPrompt,
  } = options;

  if (lastUserMessage && /(أحب|مفضل|أنا أحب|طعامي|أكلي)/.test(lastUserMessage)) {
    const trimmed = lastUserMessage.slice(0, 120).trim();
    if (trimmed.length > 5) addToSharedKnowledge(trimmed);
  }

  const ragContext = lastUserMessage
    ? getRelevantKnowledge(lastUserMessage).join("\n")
    : "";
  const memoryContext =
    recentMessages.length > 0
      ? `Recent: ${recentMessages
          .slice(-4)
          .map((m) => m.content.slice(0, 100))
          .join(" | ")}`
      : undefined;

  const systemPrompt = buildSystemPrompt(
    languageStyle,
    characterId,
    ragContext,
    memoryContext,
    { useSearch, empathyMode, ramadanMode, customSystemPrompt }
  );

  const formattedMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const response = await siliconFlowClient.chat.completions.create({
      model: SILICONFLOW_MODEL,
      messages: formattedMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    if (!text) {
      console.warn(
        "[DeepSeek] Empty response:",
        JSON.stringify(response).slice(0, 500)
      );
    }
    return text;
  } catch (err) {
    const name = err instanceof Error ? err.name : "Unknown";
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DeepSeek] ${name}: ${msg}`);
    throw err;
  }
}

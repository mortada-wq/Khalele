import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { getRelevantKnowledge, addToSharedKnowledge } from "@/lib/memory";
import type { LanguageStyle } from "@/lib/memory";
import { DEFAULT_CHARACTERS } from "@/lib/characters";

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const LANGUAGE_STYLE_PROMPTS: Record<LanguageStyle, string> = {
  formal_msa: "Use Modern Standard Arabic (الفصحى) - formal, literary style. Official and correct.",
  easy_arabic: "Use Easy Arabic (العربية السهلة) - clear, simple MSA that is accessible to all Arabic speakers. Avoid complex vocabulary.",
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
  }
): string {
  const stylePrompt = LANGUAGE_STYLE_PROMPTS[languageStyle];
  let prompt = `
You are Kheleel (خليل), an Arabic AI assistant for all Arabic-speaking countries (Iraq, Egypt, Gulf, Levant, Maghreb, etc.).

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
}

export async function invokeBedrock(
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
  } = options;

  // Extract user preferences for cross-character shared memory
  if (lastUserMessage && /(أحب|مفضل|أنا أحب|طعامي|أكلي)/.test(lastUserMessage)) {
    const trimmed = lastUserMessage.slice(0, 120).trim();
    if (trimmed.length > 5) addToSharedKnowledge(trimmed);
  }

  const ragContext = lastUserMessage ? getRelevantKnowledge(lastUserMessage).join("\n") : "";
  const memoryContext = recentMessages.length > 0
    ? `Recent: ${recentMessages.slice(-4).map((m) => m.content.slice(0, 100)).join(" | ")}`
    : undefined;

  const systemPrompt = buildSystemPrompt(languageStyle, characterId, ragContext, memoryContext, {
    useSearch,
    empathyMode,
    ramadanMode,
  });

  const formattedMessages = messages.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: [{ type: "text" as const, text: m.content }],
  }));

  const input = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    system: systemPrompt,
    messages: formattedMessages,
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(input),
  });

  try {
    const response = await client.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    const text = body.content?.[0]?.text ?? "";
    if (!text) {
      console.warn("[Bedrock] Empty response body:", JSON.stringify(body).slice(0, 500));
    }
    return text;
  } catch (err) {
    const name = err instanceof Error ? err.name : "Unknown";
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Bedrock] ${name}: ${msg}`);
    if (name === "AccessDeniedException") {
      throw new Error("Bedrock access denied — enable the model in the AWS Bedrock console (Model Access page)");
    }
    if (name === "ValidationException") {
      throw new Error(`Bedrock validation error: ${msg}`);
    }
    throw err;
  }
}

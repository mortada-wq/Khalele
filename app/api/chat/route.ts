import { NextRequest, NextResponse } from "next/server";
import { invokeDeepSeek } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      languageStyle = "easy_arabic",
      characterId,
      useSearch,
      empathyMode,
      ramadanMode,
      customSystemPrompt,
      isGuest = false,
      guestWordsRemaining,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SILICONFLOW_API_KEY ?? "";
    if (!apiKey || apiKey.startsWith("PASTE_") || apiKey === "your-key-here") {
      console.error("CHAT API: SiliconFlow API key missing or placeholder");
      return NextResponse.json(
        { error: "SiliconFlow API key not configured. Update .env.local with your SILICONFLOW_API_KEY, then restart the dev server." },
        { status: 500 }
      );
    }

    const model = process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3.2";
    console.log(`[Chat API] Sending ${messages.length} messages to DeepSeek (model: ${model}, style: ${languageStyle})`);

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content;

    // Guest mode: limit response length to stay within 1000-word budget
    const guestWordLimit = isGuest
      ? typeof guestWordsRemaining === "number"
        ? Math.max(50, Math.min(guestWordsRemaining, 350))
        : 350
      : undefined;

    const guestSystemNote = guestWordLimit
      ? `IMPORTANT: This is a guest/trial user. Keep your response under ${guestWordLimit} words. Be helpful but concise.`
      : undefined;

    const response = await invokeDeepSeek(messages, {
      languageStyle,
      lastUserMessage,
      recentMessages: messages,
      characterId: typeof characterId === "string" ? characterId : undefined,
      useSearch: isGuest ? false : useSearch,
      empathyMode: isGuest ? false : empathyMode,
      ramadanMode,
      customSystemPrompt: guestSystemNote
        ? `${guestSystemNote}${customSystemPrompt ? `\n\n${customSystemPrompt}` : ""}`
        : typeof customSystemPrompt === "string" ? customSystemPrompt : undefined,
    });

    console.log(`[Chat API] Got response (${response.length} chars)`);
    return NextResponse.json({ content: response });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errName = error instanceof Error ? error.name : "Unknown";
    console.error(`[Chat API] ERROR (${errName}):`, errMsg);
    if (error instanceof Error && error.stack) {
      console.error("[Chat API] Stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: `DeepSeek error: ${errName}`,
        details: errMsg,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { invokeBedrock } from "@/lib/aws/bedrock";
import type { ChatMessage } from "@/lib/aws/bedrock";

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

    // Check AWS Bedrock configuration
    const region = process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1";
    console.log(`[Chat API] Using AWS Bedrock in region: ${region}`);

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

    // Convert messages to ChatMessage format for Bedrock
    const bedrockMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content || "",
    }));

    const response = await invokeBedrock(bedrockMessages, {
      languageStyle,
      characterId: typeof characterId === "string" ? characterId : undefined,
      lastUserMessage,
      recentMessages: bedrockMessages,
      useSearch: isGuest ? false : useSearch,
      empathyMode: isGuest ? false : empathyMode,
      ramadanMode,
    });

    console.log(`[Chat API] Got Bedrock response (${response.length} chars)`);
    return NextResponse.json({ content: response });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errName = error instanceof Error ? error.name : "Unknown";
    console.error(`[Chat API] Bedrock ERROR (${errName}):`, errMsg);
    if (error instanceof Error && error.stack) {
      console.error("[Chat API] Stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: `AWS Bedrock error: ${errName}`,
        details: errMsg,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { invokeBedrock } from "@/lib/aws/bedrock";

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
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("CHAT API: Missing AWS credentials in environment variables");
      return NextResponse.json(
        { error: "AWS credentials not configured. Check .env.local" },
        { status: 500 }
      );
    }

    console.log(`[Chat API] Sending ${messages.length} messages to Bedrock (model: ${process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0"}, style: ${languageStyle})`);

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content;

    const response = await invokeBedrock(messages, {
      languageStyle,
      lastUserMessage,
      recentMessages: messages,
      characterId: typeof characterId === "string" ? characterId : undefined,
      useSearch,
      empathyMode,
      ramadanMode,
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
        error: `Bedrock error: ${errName}`,
        details: errMsg,
      },
      { status: 500 }
    );
  }
}

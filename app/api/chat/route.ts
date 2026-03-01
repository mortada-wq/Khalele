import { NextRequest, NextResponse } from "next/server";
import { invokeBedrock } from "@/lib/aws/bedrock";

export async function POST(req: NextRequest) {
  try {
    const { messages, languageStyle = "easy_arabic", useSearch, empathyMode, ramadanMode } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()?.content;

    const response = await invokeBedrock(messages, {
      languageStyle,
      lastUserMessage,
      recentMessages: messages,
      useSearch,
      empathyMode,
      ramadanMode,
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

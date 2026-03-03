import { NextRequest, NextResponse } from "next/server";
import { invokeDeepSeek } from "@/lib/llm";

/** Generate AI response for a prompt (used by volunteer correction UI) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, languageStyle = "easy_arabic" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.SILICONFLOW_API_KEY ?? "";
    if (!apiKey || apiKey.startsWith("PASTE_") || apiKey === "your-key-here") {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const messages = [{ role: "user" as const, content: prompt.trim() }];
    const response = await invokeDeepSeek(messages, {
      languageStyle: languageStyle === "formal_msa" ? "formal_msa" : "easy_arabic",
      lastUserMessage: prompt.trim(),
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("[Volunteer Generate]", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

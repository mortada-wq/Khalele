import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/aws/polly";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, speed } = body ?? {};
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const audioBuffer = await synthesizeSpeech(text, {
      voiceId: typeof voiceId === "string" ? voiceId : undefined,
      speed: typeof speed === "number" ? speed : undefined,
    });
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Polly error:", error);
    return NextResponse.json(
      { error: "Failed to synthesize speech" },
      { status: 500 }
    );
  }
}

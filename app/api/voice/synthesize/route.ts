import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/aws/polly";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("[Voice API] Missing AWS credentials");
      return NextResponse.json({ error: "AWS credentials not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { text, voiceId, speechSpeed, speed } = body ?? {};
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const resolvedSpeed =
      typeof speechSpeed === "number"
        ? speechSpeed
        : typeof speed === "number"
          ? speed
          : undefined;

    console.log(`[Voice API] Synthesizing ${text.length} chars, voice=${voiceId || "Zeina"}, speed=${resolvedSpeed || 1}`);

    const audioBuffer = await synthesizeSpeech(text, {
      voiceId: typeof voiceId === "string" ? voiceId : undefined,
      speed: resolvedSpeed,
    });

    console.log(`[Voice API] Got audio buffer: ${audioBuffer.length} bytes`);
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errName = error instanceof Error ? error.name : "Unknown";
    console.error(`[Voice API] ERROR (${errName}):`, errMsg);
    return NextResponse.json(
      { error: `Polly error: ${errName} — ${errMsg}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const SILICONFLOW_BASE = process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.com/v1";
const STT_MODEL = "FunAudioLLM/SenseVoiceSmall";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("file") ?? formData.get("audio");
    const file = audio instanceof Blob ? audio : null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No audio file provided. Use form field 'file' or 'audio'." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SILICONFLOW_API_KEY ?? "";
    if (!apiKey || apiKey.startsWith("PASTE_") || apiKey === "your-key-here") {
      return NextResponse.json(
        { error: "SiliconFlow API key not configured." },
        { status: 500 }
      );
    }

    const body = new FormData();
    body.append("file", file);
    body.append("model", STT_MODEL);

    const res = await fetch(`${SILICONFLOW_BASE.replace(/\/$/, "")}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[STT] SiliconFlow error:", res.status, errText);
      return NextResponse.json(
        { error: `Transcription failed: ${errText || res.statusText}` },
        { status: res.status >= 500 ? res.status : 500 }
      );
    }

    const data = (await res.json()) as { text?: string };
    const text = typeof data?.text === "string" ? data.text.trim() : "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[STT] Error:", error);
    return NextResponse.json(
      {
        error: "Speech-to-text failed",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

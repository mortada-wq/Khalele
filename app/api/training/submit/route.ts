import { NextRequest, NextResponse } from "next/server";
import { saveTrainingSession } from "@/lib/aws/dynamodb";
import { uploadFile, S3_BUCKET } from "@/lib/aws/s3";

function getUserId(req: NextRequest): string {
  const header = req.headers.get("x-user-id");
  if (header) return header;
  return "anon_anonymous";
}

function parsePrompts(value: FormDataEntryValue | null): string[] | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return null;
    const prompts = parsed
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter((p) => p.length > 0);
    return prompts.length > 0 ? prompts : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = getUserId(req);

    const nativeSpeaker = formData.get("nativeSpeaker") === "true";
    const dialect = (formData.get("dialect") as string) || undefined;
    const region = (formData.get("region") as string) || undefined;
    const gender = (formData.get("gender") as string) || undefined;

    const prompts = parsePrompts(formData.get("prompts"));
    if (!prompts) {
      return NextResponse.json({ error: "Invalid prompts payload" }, { status: 400 });
    }

    for (const key of formData.keys()) {
      const m = /^audio_(\d+)$/.exec(key);
      if (!m) continue;
      const idx = Number(m[1]);
      if (!Number.isInteger(idx) || idx < 0 || idx >= prompts.length) {
        return NextResponse.json({ error: `Invalid audio index: ${key}` }, { status: 400 });
      }
    }

    // Keep arrays aligned with prompts by index for review accuracy.
    const audioFiles: string[] = Array.from({ length: prompts.length }, () => "");
    const transcripts: string[] = Array.from({ length: prompts.length }, (_, i) => {
      const t = formData.get(`transcript_${i}`);
      return typeof t === "string" ? t.trim() : "";
    });

    const sessionId = `ts-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    let recordedCount = 0;

    for (let i = 0; i < prompts.length; i++) {
      const audio = formData.get(`audio_${i}`) as File | null;
      if (audio && audio instanceof Blob && audio.size > 0) {
        if (audio.size > 25 * 1024 * 1024) {
          return NextResponse.json({ error: `Audio file too large at index ${i}` }, { status: 400 });
        }

        const ext = audio.name?.split(".").pop() || "webm";
        const key = `training-sessions/${sessionId}/prompt_${i}.${ext}`;
        const buffer = Buffer.from(await audio.arrayBuffer());
        await uploadFile(key, buffer, audio.type || "audio/webm");
        audioFiles[i] = `s3://${S3_BUCKET}/${key}`;
        recordedCount += 1;
      }
    }

    if (recordedCount === 0) {
      return NextResponse.json({ error: "At least one valid audio recording is required" }, { status: 400 });
    }

    const session = {
      sessionId,
      userId,
      nativeSpeaker,
      dialect,
      region,
      gender,
      audioFiles,
      transcripts,
      status: "pending" as const,
      metadata: { prompts, recordedCount, promptCount: prompts.length },
      createdAt: now,
      updatedAt: now,
    };

    await saveTrainingSession(session);
    return NextResponse.json({ sessionId, success: true });
  } catch (error) {
    console.error("Training submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit training data", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

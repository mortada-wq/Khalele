import { NextRequest, NextResponse } from "next/server";
import { saveTrainingSession } from "@/lib/aws/dynamodb";
import { uploadFile, S3_BUCKET } from "@/lib/aws/s3";

const USER_ID_KEY = "khalele_user_id";

function getUserId(req: NextRequest): string {
  const header = req.headers.get("x-user-id");
  if (header) return header;
  return "anon_anonymous";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = getUserId(req);

    const nativeSpeaker = formData.get("nativeSpeaker") === "true";
    const dialect = (formData.get("dialect") as string) || undefined;
    const region = (formData.get("region") as string) || undefined;
    const gender = (formData.get("gender") as string) || undefined;

    const promptsJson = formData.get("prompts") as string;
    const prompts: string[] = promptsJson ? JSON.parse(promptsJson) : [];

    const audioFiles: string[] = [];
    const transcripts: string[] = [];

    const sessionId = `ts-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    for (let i = 0; i < prompts.length; i++) {
      const audio = formData.get(`audio_${i}`) as File | null;
      const transcript = formData.get(`transcript_${i}`) as string | null;
      if (audio && audio instanceof Blob && audio.size > 0) {
        const ext = audio.name?.split(".").pop() || "webm";
        const key = `training-sessions/${sessionId}/prompt_${i}.${ext}`;
        const buffer = Buffer.from(await audio.arrayBuffer());
        await uploadFile(key, buffer, audio.type || "audio/webm");
        audioFiles.push(`s3://${S3_BUCKET}/${key}`);
      }
      if (transcript && typeof transcript === "string") {
        transcripts.push(transcript);
      }
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
      metadata: { prompts },
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

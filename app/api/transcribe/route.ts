import { NextRequest, NextResponse } from "next/server";
import { startTranscriptionJob, getTranscriptionResult } from "@/lib/aws/transcribe";
import { uploadFile, S3_BUCKET } from "@/lib/aws/s3";
import { TranscriptionJobStatus } from "@aws-sdk/client-transcribe";
import { GetTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import { TranscribeClient } from "@aws-sdk/client-transcribe";

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 120000; // 2 minutes

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio file in FormData (key: audio)" }, { status: 400 });
    }

    const jobName = `kheleel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const ext = audio.name?.split(".").pop()?.toLowerCase() || "wav";
    const validExt = ["wav", "mp3", "mp4", "ogg", "flac", "amr", "webm"].includes(ext) ? ext : "wav";
    const key = `transcribe-input/${jobName}.${validExt}`;

    const buffer = Buffer.from(await audio.arrayBuffer());
    const contentType = audio.type || (validExt === "mp3" ? "audio/mpeg" : "audio/wav");
    await uploadFile(key, buffer, contentType);

    const mediaUri = `s3://${S3_BUCKET}/${key}`;

    await startTranscriptionJob(mediaUri, jobName);

    const client = new TranscribeClient({ region: process.env.AWS_REGION || "us-east-1" });
    const start = Date.now();
    while (Date.now() - start < MAX_WAIT_MS) {
      const result = await client.send(new GetTranscriptionJobCommand({ TranscriptionJobName: jobName }));
      const status = result.TranscriptionJob?.TranscriptionJobStatus;
      if (status === TranscriptionJobStatus.COMPLETED) {
        const transcript = await getTranscriptionResult(jobName);
        return NextResponse.json({ transcript });
      }
      if (status === TranscriptionJobStatus.FAILED) {
        const reason = result.TranscriptionJob?.FailureReason || "Transcription failed";
        return NextResponse.json({ error: reason }, { status: 500 });
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    return NextResponse.json({ error: "Transcription timed out" }, { status: 504 });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

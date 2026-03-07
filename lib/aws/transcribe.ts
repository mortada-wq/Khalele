import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscriptionJobStatus,
} from "@aws-sdk/client-transcribe";

const client = new TranscribeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const OUTPUT_BUCKET = process.env.S3_TRANSCRIPTION_BUCKET || process.env.S3_TRAINING_BUCKET || "kheleel-training-data";

export async function startTranscriptionJob(
  audioUri: string,
  jobName: string,
  vocabularyName?: string
): Promise<string> {
  const input: Record<string, unknown> = {
    TranscriptionJobName: jobName,
    LanguageCode: "ar-SA",
    Media: { MediaFileUri: audioUri },
    OutputBucketName: OUTPUT_BUCKET,
    OutputKey: `transcriptions/${jobName}.json`,
  };

  if (vocabularyName) {
    input.Settings = { VocabularyName: vocabularyName };
  }

  await client.send(
    new StartTranscriptionJobCommand(input as never)
  );
  return jobName;
}

export async function getTranscriptionResult(jobName: string): Promise<string> {
  const result = await client.send(
    new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
  );

  const status = result.TranscriptionJob?.TranscriptionJobStatus;
  if (status !== TranscriptionJobStatus.COMPLETED) {
    throw new Error(`Transcription not ready: ${status}`);
  }

  const transcriptUri = result.TranscriptionJob?.Transcript?.TranscriptFileUri;
  if (!transcriptUri) throw new Error("No transcript URI");

  const fetchResult = await fetch(transcriptUri);
  const data = await fetchResult.json();
  return data.results?.transcripts?.[0]?.transcript ?? "";
}

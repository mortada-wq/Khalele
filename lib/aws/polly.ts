import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId,
} from "@aws-sdk/client-polly";
import { VOICE_MAP } from "@/lib/voices";

const client = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const VOICE_ID = process.env.POLLY_VOICE_ID || "Zeina";

function escapeForSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function synthesizeSpeech(
  text: string,
  options?: { voiceId?: string; ssml?: boolean; speed?: number }
): Promise<Buffer> {
  const voiceId = options?.voiceId || VOICE_ID;
  const voiceMeta = VOICE_MAP[voiceId];
  const speed = options?.speed ?? 1;
  const engine = voiceMeta?.engine ?? "standard";
  const languageCode = voiceMeta?.languageCode ?? "arb";

  let finalText = text;
  let textType: "text" | "ssml" = "text";
  if (options?.ssml) {
    textType = "ssml";
  } else if (speed !== 1) {
    const rate = Math.round(Math.max(0.2, Math.min(2, speed)) * 100);
    finalText = `<speak><prosody rate="${rate}%">${escapeForSsml(text)}</prosody></speak>`;
    textType = "ssml";
  }

  const command = new SynthesizeSpeechCommand({
    Engine: engine,
    Text: finalText,
    OutputFormat: "mp3",
    VoiceId: voiceId as VoiceId,
    LanguageCode: languageCode,
    TextType: textType,
  });

  const response = await client.send(command);
  const stream = response.AudioStream;
  if (!stream) throw new Error("No audio stream");

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

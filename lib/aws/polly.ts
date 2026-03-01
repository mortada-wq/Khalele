import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const VOICE_ID = process.env.POLLY_VOICE_ID || "Zeina"; // Arabic neural voice

export async function synthesizeSpeech(
  text: string,
  options?: { voiceId?: string; ssml?: boolean }
): Promise<Buffer> {
  const voiceId = options?.voiceId || VOICE_ID;

  const command = new SynthesizeSpeechCommand({
    Engine: "neural",
    Text: text,
    OutputFormat: "mp3",
    VoiceId: voiceId as "Zeina" | "Zayd",
    LanguageCode: "arb",
    TextType: options?.ssml ? "ssml" : "text",
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

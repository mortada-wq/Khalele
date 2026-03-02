import textToSpeech from "@google-cloud/text-to-speech";
import { VOICE_MAP } from "@/lib/voices";

function createClient() {
  const credsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (credsJson) {
    const credentials = JSON.parse(credsJson);
    return new textToSpeech.TextToSpeechClient({ credentials });
  }
  return new textToSpeech.TextToSpeechClient();
}

const client = createClient();

export async function synthesizeSpeech(
  text: string,
  options?: { voiceId?: string; speed?: number }
): Promise<Buffer> {
  const voiceId = options?.voiceId || "ar-XA-Wavenet-A";
  const voiceMeta = VOICE_MAP[voiceId];
  const speed = options?.speed ?? 1;
  const languageCode = voiceMeta?.languageCode ?? "ar-XA";

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode,
      name: voiceId,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: Math.max(0.25, Math.min(4, speed)),
    },
  });

  if (!response.audioContent) throw new Error("No audio content from Google TTS");
  return Buffer.from(response.audioContent as Uint8Array);
}

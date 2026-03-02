import textToSpeech from "@google-cloud/text-to-speech";
import { VOICE_MAP } from "@/lib/voices";

let _client: textToSpeech.TextToSpeechClient | null = null;

function getClient(): textToSpeech.TextToSpeechClient {
  if (_client) return _client;

  const credsJson = process.env.GOOGLE_CLOUD_CREDENTIALS;
  if (credsJson) {
    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(credsJson);
    } catch (e) {
      throw new Error(
        `GOOGLE_CLOUD_CREDENTIALS contains invalid JSON: ${e instanceof Error ? e.message : String(e)}`
      );
    }
    _client = new textToSpeech.TextToSpeechClient({ credentials });
  } else {
    _client = new textToSpeech.TextToSpeechClient();
  }

  return _client;
}

export async function synthesizeSpeech(
  text: string,
  options?: { voiceId?: string; speed?: number }
): Promise<Buffer> {
  const client = getClient();
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

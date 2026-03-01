"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  disabled?: boolean;
}

function VoiceWaveIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="voice-wave-bars">
      <rect x="2" y="8" width="3" height="8" rx="1" />
      <rect x="7" y="5" width="3" height="14" rx="1" />
      <rect x="12" y="3" width="3" height="18" rx="1" />
      <rect x="17" y="6" width="3" height="12" rx="1" />
    </svg>
  );
}

export function SpeakButton({ text, disabled = false }: SpeakButtonProps) {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speak = async () => {
    if (!text || disabled) return;
    setLoading(true);
    setSpeaking(false);
    try {
      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setSpeaking(true);
      await audio.play();
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      setSpeaking(true);
      speechSynthesis.speak(u);
      u.onend = () => setSpeaking(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={speak}
      disabled={disabled || loading}
      className="p-2 rounded-lg hover:bg-black/5 hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
      style={{ color: "#5a5a5a" }}
      title="استمع"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : speaking ? <VoiceWaveIcon size={18} /> : <Volume2 size={18} />}
    </button>
  );
}

"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  disabled?: boolean;
}

export function SpeakButton({ text, disabled = false }: SpeakButtonProps) {
  const [loading, setLoading] = useState(false);

  const speak = async () => {
    if (!text || disabled) return;
    setLoading(true);
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
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch {
      // Fallback: browser TTS if Polly fails
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      speechSynthesis.speak(u);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={speak}
      disabled={disabled || loading}
      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-khalele-gold transition-colors"
      title="استمع"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
    </button>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  variant?: "default" | "minimal";
}

export function MicButton({ onTranscript, disabled = false, variant = "default" }: MicButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const Win = window as unknown as { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition };
    const RecognitionClass = Win.SpeechRecognition || Win.webkitSpeechRecognition;

    if (!RecognitionClass) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new RecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "ar-SA";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [onTranscript]);

  const toggle = () => {
    if (disabled || error) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const minimalClass = variant === "minimal"
    ? "p-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--foreground)] bg-transparent border-0"
    : "";
  const defaultClass = variant === "default"
    ? `p-3 rounded-xl transition-colors ${
        isListening
          ? "bg-red-500/20 text-red-400 border border-red-500/40"
          : "bg-white/5 text-white/80 hover:bg-khalele-gold/20 hover:text-khalele-gold border border-white/10"
      }`
    : "";

  return (
    <button
      onClick={toggle}
      disabled={disabled || !!error}
      title={error || (isListening ? "إيقاف" : "تحدث")}
      className={`${variant === "minimal" ? minimalClass : defaultClass} disabled:opacity-50`}
    >
      {isListening ? <MicOff size={variant === "minimal" ? 20 : 24} /> : <Mic size={variant === "minimal" ? 20 : 24} />}
    </button>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

type VoiceState = "idle" | "listening" | "speaking";

interface VoiceOverlayProps {
  open: boolean;
  onClose: () => void;
  onTranscript?: (text: string) => void;
}

export function VoiceOverlay({ open, onClose, onTranscript }: VoiceOverlayProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const Win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const RecognitionClass = Win.SpeechRecognition || Win.webkitSpeechRecognition;

    if (RecognitionClass) {
      const recognition = new RecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ar-SA";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        if (event.results[event.results.length - 1].isFinal && transcript.trim()) {
          onTranscript?.(transcript);
        }
      };

      recognition.onend = () => setState("idle");
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [open, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setState("listening");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState("idle");
  };

  if (!open) return null;

  const orbColor =
    state === "listening"
      ? "#dc2626"
      : state === "speaking"
        ? "var(--color-accent)"
        : "var(--color-accent-tint-40)";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center font-ui"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 text-white/80"
        aria-label="إغلاق"
      >
        <X size={24} />
      </button>

      {/* Animated orb */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: state === "idle" ? 120 : state === "listening" ? 160 : 140,
            height: state === "idle" ? 120 : state === "listening" ? 160 : 140,
            background: orbColor,
            boxShadow: `0 0 60px ${orbColor}, 0 0 120px ${orbColor}40`,
            animation:
              state === "listening"
                ? "voice-orb-pulse 1.2s ease-in-out infinite"
                : state === "speaking"
                  ? "voice-orb-breathe 2s ease-in-out infinite"
                  : "none",
          }}
        />
      </div>

      <p className="text-white/90 text-lg mb-6">
        {state === "idle" && "اضغط لبدء التحدث"}
        {state === "listening" && "أنا أستمع..."}
        {state === "speaking" && "خليل يتحدث..."}
      </p>

      <button
        onClick={state === "listening" ? stopListening : startListening}
        className="px-8 py-4 rounded-2xl font-medium text-white transition-colors"
        style={{
          background: state === "listening" ? "#dc2626" : "var(--color-accent)",
        }}
      >
        {state === "listening" ? "إيقاف" : "ابدأ"}
      </button>
    </div>
  );
}

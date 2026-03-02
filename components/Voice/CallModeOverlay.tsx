"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const SILENCE_MS = 1500;

type CallState = "listening" | "processing" | "speaking" | "idle" | "permission-denied";

interface CallModeOverlayProps {
  open: boolean;
  onClose: () => void;
  onSendAndGetResponse: (text: string) => Promise<string | null>;
  speechSpeed?: number;
  voiceId?: string;
}

export function CallModeOverlay({
  open,
  onClose,
  onSendAndGetResponse,
  speechSpeed = 1,
  voiceId = "Zeina",
}: CallModeOverlayProps) {
  const [state, setState] = useState<CallState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const onSendRef = useRef(onSendAndGetResponse);
  onSendRef.current = onSendAndGetResponse;

  const speakViaPolly = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;
      setState("speaking");
      try {
        const res = await fetch("/api/voice/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speed: speechSpeed, voiceId }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            audioUrlRef.current = null;
            resolve();
          };
          audio.onerror = reject;
          audio.play().catch(reject);
        });
      } catch {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ar-SA";
        await new Promise<void>((resolve) => {
          u.onend = () => resolve();
          speechSynthesis.speak(u);
        });
      } finally {
        // Caller will set state and restart listening
      }
    },
    [speechSpeed, voiceId]
  );

  const startListeningRef = useRef<() => void>(() => {});
  const processAndRespondRef = useRef<(t: string) => Promise<void>>(async () => {});

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const processAndRespond = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setState("listening");
        startListeningRef.current();
        return;
      }
      stopListening();
      setState("processing");
      accumulatedRef.current = "";
      setInterimTranscript("");
      try {
        const aiResponse = await onSendRef.current(trimmed);
        if (aiResponse?.trim()) {
          await speakViaPolly(aiResponse);
        }
        setState("listening");
        startListeningRef.current();
      } catch {
        setState("listening");
        startListeningRef.current();
      }
    },
    [speakViaPolly, stopListening]
  );
  processAndRespondRef.current = processAndRespond;

  const startListening = useCallback(() => {
    const Win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const RecognitionClass = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!RecognitionClass) return;

    const recognition = new RecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ar-SA";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        const t = r[0].transcript;
        if (r.isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      if (final) {
        accumulatedRef.current = (accumulatedRef.current + " " + final).trim();
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          const toSend = accumulatedRef.current.trim();
          if (toSend) {
            void processAndRespondRef.current(toSend);
          }
        }, SILENCE_MS);
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      if (open && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // Already started or stopped
        }
      }
    };

    recognition.onerror = (event: Event) => {
      const err = (event as { error?: string }).error;
      // Don't retry on permission denied or aborted
      if (err === "not-allowed" || err === "aborted") {
        recognitionRef.current = null;
        setState(err === "not-allowed" ? "permission-denied" : "idle");
        return;
      }
      if (open && recognitionRef.current === recognition) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Ignore
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState("listening");
  }, [open]);

  startListeningRef.current = startListening;

  useEffect(() => {
    if (!open) {
      stopListening();
      setState("idle");
      setInterimTranscript("");
      accumulatedRef.current = "";
      return;
    }
    setState("listening");
    const t = setTimeout(startListening, 100);
    return () => {
      clearTimeout(t);
      stopListening();
    };
  }, [open, startListening, stopListening]);

  if (!open) return null;

  const pulseColor =
    state === "listening"
      ? "#dc2626"
      : state === "speaking"
        ? "var(--color-accent)"
        : state === "processing"
          ? "var(--color-accent-tint-40)"
          : state === "permission-denied"
            ? "#b91c1c"
            : "var(--color-accent-tint-40)";

  const statusText =
    state === "listening"
      ? interimTranscript || "أنا أستمع..."
      : state === "processing"
        ? "خليل يفكر..."
        : state === "speaking"
          ? "خليل يتحدث..."
          : state === "permission-denied"
            ? "يرجى السماح للميكروفون للمتابعة"
            : "جاري التحضير...";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center font-ui"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      {/* Voice Pulse - Framer Motion */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          animate={{
            scale: state === "listening" ? [1, 1.15, 1] : state === "speaking" ? [1, 1.08, 1] : 1,
            opacity: 1,
          }}
          transition={{
            duration: state === "listening" ? 0.8 : state === "speaking" ? 1.2 : 0.3,
            repeat: state === "listening" || state === "speaking" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="rounded-full"
          style={{
            width: 180,
            height: 180,
            background: pulseColor,
            boxShadow: `0 0 80px ${pulseColor}60, 0 0 160px ${pulseColor}30`,
          }}
        />
        {state === "processing" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full border-4 border-t-transparent"
            style={{
              width: 200,
              height: 200,
              borderColor: "var(--color-accent-tint-40)",
              borderTopColor: "var(--color-accent)",
            }}
          />
        )}
      </div>

      <p className="text-white/90 text-lg mb-12 px-4 text-center min-h-[2rem]">
        {statusText}
      </p>

      {/* Large X button at bottom */}
      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
        aria-label="إنهاء المكالمة"
      >
        <X size={28} />
      </button>
    </motion.div>
  );
}

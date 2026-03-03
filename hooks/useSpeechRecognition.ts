"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    ?? null;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = "ar-SA", onResult, onError, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  const isSupported = typeof window !== "undefined" && !!getSpeechRecognition();

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      const msg = "الكتابة الصوتية غير مدعومة في هذا المتصفح";
      setError(msg);
      onErrorRef.current?.(msg);
      return;
    }

    const rec = new Recognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        onResultRef.current?.(finalTranscript.trim());
      }
    };
    rec.onerror = (e: Event & { error?: string }) => {
      const err = e.error ?? "unknown";
      if (err === "no-speech" || err === "aborted") return;
      const msg =
        err === "not-allowed"
          ? "لم يتم منح إذن الميكروفون"
          : err === "network"
            ? "خطأ في الشبكة"
            : "خطأ في التعرف الصوتي";
      setError(msg);
      onErrorRef.current?.(msg);
      stop();
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      onEnd?.();
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch (err) {
      const msg = "فشل بدء التسجيل";
      setError(msg);
      onErrorRef.current?.(msg);
    }
  }, [lang, stop, onEnd]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => () => stop(), [stop]);

  return { isListening, start, stop, toggle, error, isSupported };
}

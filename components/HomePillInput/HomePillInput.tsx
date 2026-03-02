"use client";

import { useRef } from "react";
import { SendIcon, MicIcon, AttachmentIcon, WaveformIcon, IncognitoIcon } from "./Icons";
import { MicButton } from "@/components/Voice/MicButton";

/**
 * Home page chat input — EXACT match to design.svg:
 * - Pill: 57.46px height, 28.73px radius, fill #d9d9d9→#dedede, stroke #f2f2f2→#fff
 * - Left: waveform | Center: input | Right: send (paper plane)
 * - Second row: mic + attachment below pill
 */

interface HomePillInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onMicTranscript?: (text: string) => void;
  /** Called when the voice icon inside the pill is clicked - should open voice calling mode */
  onVoiceMode?: () => void;
  /** Custom attach handler; if provided, clicking attachment calls this instead of the file picker */
  onAttach?: () => void;
  /** Called when files are selected via the default file picker (when onAttach is not passed) */
  onFiles?: (files: FileList) => void;
  /** Incognito mode: chat without user identity. Toggle shows beside mic/attachment. */
  incognitoMode?: boolean;
  onIncognitoChange?: (enabled: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PILL_HEIGHT = 57.46;
const PILL_RADIUS = 28.73;
const PILL_PADDING_X = 22;
const ICON_SIZE = 22;
const ROW_ICON_SIZE = 20;
const ROW_MARGIN_TOP = 12;

export function HomePillInput({
  value,
  onChange,
  onSend,
  onMicTranscript,
  onVoiceMode,
  onAttach,
  onFiles,
  incognitoMode = false,
  onIncognitoChange,
  placeholder = "سلام عليكم..",
  disabled = false,
}: HomePillInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
    // Shift+Enter = new line (default textarea behavior)
  };

  const handleAttach = () => {
    if (onAttach) {
      onAttach();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Main pill bar */}
      <div
        className="home-pill-bar relative flex items-center transition-all duration-200"
        style={{
          minHeight: PILL_HEIGHT,
          borderRadius: PILL_RADIUS,
        }}
      >
        {/* Right (RTL first child): Waveform (voice indicator) - NOW CLICKABLE */}
        <button
          type="button"
          onClick={onVoiceMode}
          disabled={disabled || !onVoiceMode}
          className="shrink-0 flex items-center justify-center text-[#4a4a4a] self-center hover:text-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ width: PILL_PADDING_X + ICON_SIZE, height: PILL_HEIGHT }}
          aria-label="وضع المكالمة الصوتية"
          title="ابدأ محادثة صوتية مع خليل"
        >
          <WaveformIcon size={ICON_SIZE} />
        </button>

        {/* Center: Text input — Enter to send, Shift+Enter for new line */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="font-ui flex-1 bg-transparent border-0 focus:outline-none min-w-0 resize-none py-3 leading-normal placeholder:text-[var(--text-tertiary)]"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            minHeight: 24,
            maxHeight: 120,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        />

        {/* Left (RTL last child): Send (paper plane) */}
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="shrink-0 flex items-center justify-center self-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: "var(--color-accent)", width: PILL_PADDING_X + ICON_SIZE, height: PILL_HEIGHT }}
          aria-label="إرسال"
        >
          <SendIcon size={ICON_SIZE} />
        </button>
      </div>

      {/* Second row: Mic + Attachment — below pill, dark gray outline, ~18–24px gap */}
      <div
        className="flex items-center gap-6"
        style={{
          marginTop: ROW_MARGIN_TOP,
          marginInlineStart: PILL_PADDING_X,
        }}
      >
        {onMicTranscript ? (
          <MicButton onTranscript={onMicTranscript} disabled={disabled} variant="minimal" />
        ) : (
          <div className="p-2 text-[var(--text-subtle)] opacity-50 cursor-not-allowed" aria-hidden>
            <MicIcon size={ROW_ICON_SIZE} />
          </div>
        )}
        <button
          type="button"
          onClick={handleAttach}
          disabled={disabled}
          className="p-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
          aria-label="إرفاق ملف"
        >
          <AttachmentIcon size={ROW_ICON_SIZE} />
        </button>
        {onIncognitoChange && (
          <button
            type="button"
            onClick={() => onIncognitoChange(!incognitoMode)}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 hover:opacity-80"
            style={{
              color: incognitoMode ? "var(--color-accent)" : "var(--text-subtle)",
            }}
            aria-label={incognitoMode ? "وضع خاص مفعّل" : "وضع خاص"}
            title={incognitoMode ? "المحادثة بدون معرفة المستخدم — مفعّل" : "المحادثة بدون معرفة المستخدم"}
          >
            <IncognitoIcon size={ROW_ICON_SIZE} />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="*/*"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length && onFiles) {
            onFiles(files);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

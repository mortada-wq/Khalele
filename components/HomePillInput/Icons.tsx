"use client";

/**
 * SVG icons matching design.svg stroke style: round caps, stroke-width ~1.5px.
 * Sizes: 20–24px for pill icons, 20px for second-row icons.
 */

const strokeProps = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SendIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        {...strokeProps}
      />
    </svg>
  );
}

export function MicIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"
        stroke="currentColor"
        {...strokeProps}
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" {...strokeProps} />
      <path d="M12 19v4" stroke="currentColor" {...strokeProps} />
      <path d="M8 23h8" stroke="currentColor" {...strokeProps} />
    </svg>
  );
}

export function AttachmentIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        {...strokeProps}
      />
    </svg>
  );
}

/**
 * Waveform — vertical bars of varying heights, dark gray outline.
 */
export function WaveformIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 8v8" stroke="currentColor" {...strokeProps} />
      <path d="M9 10v4" stroke="currentColor" {...strokeProps} />
      <path d="M12 4v16" stroke="currentColor" strokeOpacity={0.7} {...strokeProps} />
      <path d="M15 10v4" stroke="currentColor" {...strokeProps} />
      <path d="M19 8v8" stroke="currentColor" {...strokeProps} />
    </svg>
  );
}

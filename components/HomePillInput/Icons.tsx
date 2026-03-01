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
 * Incognito / private chat — Material icon (chat_dashed).
 * When active, use gold color; when inactive, use subtle gray.
 */
export function IncognitoIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" className={className}>
      <path d="M80-480v-160h80v160H80Zm0 400v-320h80v125l46-45h114v80h-80L80-80Zm320-160v-80h160v80H400Zm240 0v-80h160v-80h80v80q0 33-23.5 56.5T800-240H640Zm160-240v-160h80v160h-80Zm0-239v-81H640v-80h160q33 0 56.5 23.5T880-800v81h-80Zm-400-81v-80h160v80H400ZM80-719v-81q0-33 23.5-56.5T160-880h160v80H160v81H80Z" />
    </svg>
  );
}

/**
 * Waveform — 5 bars from actual brand SVG (viewBox 37.99×37.99).
 */
export function WaveformIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 37.99 37.99" fill="none" className={className}>
      <path d="M18.99,2.13v33.73" stroke="#434345" strokeWidth="4.25" strokeLinecap="round" strokeMiterlimit="10" />
      <path d="M27.43,8.45v21.08" stroke="#434345" strokeWidth="4.25" strokeLinecap="round" strokeMiterlimit="10" />
      <path d="M10.56,12.67v12.65" stroke="#434345" strokeWidth="4.25" strokeLinecap="round" strokeMiterlimit="10" />
      <path d="M35.86,14.78v8.43" stroke="#434345" strokeWidth="4.25" strokeLinecap="round" strokeMiterlimit="10" />
      <path d="M2.13,14.78v8.43" stroke="#434345" strokeWidth="4.25" strokeLinecap="round" strokeMiterlimit="10" />
    </svg>
  );
}

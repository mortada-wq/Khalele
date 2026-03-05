"use client";

export interface KheleelLogoProps {
  className?: string;
  alt?: string;
}

export function KheleelLogo({ className = "", alt = "خليلي" }: KheleelLogoProps) {
  return (
    <img
      src="/logo/logo_white.png"
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}

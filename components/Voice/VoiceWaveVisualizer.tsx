"use client";

import { motion } from "framer-motion";

interface VoiceWaveVisualizerProps {
  isActive?: boolean;
  intensity?: number; // 0-1
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VoiceWaveVisualizer({
  isActive = true,
  intensity = 0.7,
  color = "var(--color-accent)",
  size = "md",
  className = "",
}: VoiceWaveVisualizerProps) {
  const sizeClasses = {
    sm: "h-4 w-16",
    md: "h-6 w-24",
    lg: "h-8 w-32",
  };

  const barCount = 5;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  // Animation variants for each bar
  const barVariants = {
    rest: (i: number) => ({
      height: "20%",
      y: "40%",
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: "easeInOut",
      },
    }),
    active: (i: number) => ({
      height: `${20 + Math.sin(i * 0.8) * 60 * intensity}%`,
      y: `${Math.sin(i * 1.2) * 10}%`,
      transition: {
        duration: 0.8,
        delay: i * 0.15,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${sizeClasses[size]} ${className}`}>
      {bars.map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={barVariants}
          initial="rest"
          animate={isActive ? "active" : "rest"}
          style={{
            backgroundColor: color,
            width: "3px",
            borderRadius: "2px",
            opacity: 0.8,
          }}
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
}

// Circular voice wave for compact spaces
export function CircularVoiceWave({
  isActive = true,
  intensity = 0.7,
  color = "var(--color-accent)",
  size = "md",
  className = "",
}: VoiceWaveVisualizerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const waveCount = 8;
  const waves = Array.from({ length: waveCount }, (_, i) => i);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {waves.map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: color,
            opacity: 0.3,
          }}
          initial={{
            scale: 0.3,
            opacity: 0,
          }}
          animate={
            isActive
              ? {
                  scale: [0.3, 1, 0.3],
                  opacity: [0, 0.6, 0],
                }
              : {
                  scale: 0.3,
                  opacity: 0,
                }
          }
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            repeatType: "loop" as const,
            ease: "easeInOut",
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: color,
          opacity: 0.9,
        }}
      >
        <motion.div
          className="w-1/2 h-1/2 rounded-full"
          style={{
            backgroundColor: "white",
          }}
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

// Voice wave for AI response indicator
export function AIResponseIndicator({ isSpeaking = false }: { isSpeaking?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-transparent via-var(--color-accent-tint-08) to-transparent">
      <VoiceWaveVisualizer isActive={isSpeaking} size="sm" />
      <span className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>
        {isSpeaking ? "خليل يتحدث..." : "خليل يفكر..."}
      </span>
    </div>
  );
}
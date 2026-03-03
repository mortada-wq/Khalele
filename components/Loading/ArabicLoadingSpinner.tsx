"use client";

import { motion } from "framer-motion";

interface ArabicLoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  text?: string;
  showText?: boolean;
  className?: string;
}

export function ArabicLoadingSpinner({
  size = "md",
  color = "var(--color-accent)",
  text = "جاري التحميل",
  showText = true,
  className = "",
}: ArabicLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // Arabic calligraphy-inspired dots
  const dots = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative" style={{ width: sizeClasses[size], height: sizeClasses[size] }}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color, opacity: 0.3 }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2"
          style={{ borderColor: color, opacity: 0.5 }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner dots */}
        {dots.map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: "4px",
              height: "4px",
              left: "50%",
              top: "50%",
              marginLeft: "-2px",
              marginTop: "-2px",
            }}
            initial={{
              x: 0,
              y: 0,
            }}
            animate={{
              x: Math.cos((i / dots.length) * Math.PI * 2) * 20,
              y: Math.sin((i / dots.length) * Math.PI * 2) * 20,
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Center Arabic ornament */}
        <motion.div
          className="absolute inset-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color, opacity: 0.8 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-white text-xs font-bold">خ</div>
        </motion.div>
      </div>

      {showText && (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className={`font-arabic font-medium ${textSizeClasses[size]}`}
            style={{ color: "var(--text-secondary)" }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {text}
          </motion.div>
          
          {/* Arabic dots loading animation */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loading bar with Arabic pattern
export function ArabicLoadingBar({ progress = 0, className = "" }: { progress?: number; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        
        {/* Arabic pattern overlay */}
        <motion.div
          className="absolute top-0 left-0 h-full w-full"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["-200% 0", "200% 0"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>جاري التحميل</span>
        <span className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Loading skeleton with Arabic calligraphy effect
export function ArabicLoadingSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="space-y-2">
          <motion.div
            className="h-4 rounded-full"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
            initial={{ opacity: 0.5, width: "60%" }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              width: ["60%", "80%", "60%"],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {i === lines - 1 && (
            <motion.div
              className="h-3 rounded-full"
              style={{ backgroundColor: "var(--bg-tertiary)", width: "40%" }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      ))}
      
      {/* Arabic ornament at the end */}
      <div className="flex justify-center pt-2">
        <motion.div
          className="text-2xl"
          style={{ color: "var(--color-accent)" }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          خ
        </motion.div>
      </div>
    </div>
  );
}
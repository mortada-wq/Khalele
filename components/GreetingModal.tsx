"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function GreetingModal() {
  const { data: session } = useSession();
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("");

  useEffect(() => {
    if (!session?.user) return;

    const checkGreeting = async () => {
      try {
        const res = await fetch("/api/auth/greeting");
        if (res.ok) {
          const data = await res.json();
          if (data.needsGreeting) {
            setGreetingMessage(data.greetingMessage);
            setShowGreeting(true);
          }
        }
      } catch (error) {
        console.error("Error checking greeting:", error);
      }
    };

    checkGreeting();
  }, [session]);

  const handleClose = async () => {
    try {
      await fetch("/api/auth/greeting", { method: "POST" });
      setShowGreeting(false);
    } catch (error) {
      console.error("Error marking greeting as received:", error);
      setShowGreeting(false);
    }
  };

  if (!showGreeting) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleClose}
    >
      <div
        className="max-w-lg w-full rounded-2xl p-6 shadow-2xl"
        dir="rtl"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-ui text-xl font-bold" style={{ color: "#231f20" }}>
            مرحباً بك! 👋
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: "#8c8c8c" }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 font-ui leading-8 text-sm" style={{ color: "#2f2f2f" }}>
          {greetingMessage.split("\n\n").map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="mt-6 w-full px-6 py-3 rounded-xl font-ui text-sm font-medium transition-colors hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
}

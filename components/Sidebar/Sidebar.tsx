"use client";

import Link from "next/link";
import { BirdToggle } from "@/components/BirdToggle";
import { UserProfile } from "./UserProfile";

const SIDEBAR_W = 220;

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconPlus() {
  return (
    <svg {...iconProps}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg {...iconProps}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export interface SidebarProps {
  onCreateDiwan?: () => void;
  onCreateGroup?: () => void;
  notificationCount?: number;
}

export function Sidebar({
  onCreateDiwan,
  onCreateGroup,
  notificationCount = 0,
}: SidebarProps) {
  return (
    <aside
      className="hidden md:flex shrink-0 flex-col"
      style={{
        width: SIDEBAR_W,
        height: "100vh",
        background: "#121212",
        padding: "32px 24px",
        zIndex: 10,
      }}
    >
      {/* 1. Bird logo + notification dot */}
      <div className="shrink-0 relative" style={{ marginBottom: 32 }}>
        <BirdToggle expanded={true} size={48} />
        {notificationCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              background: "#ff4444",
              borderRadius: "50%",
              border: "2px solid #121212",
            }}
          />
        )}
      </div>

      {/* 2. ابدأ محادثة — Start a chat */}
      <button
        type="button"
        onClick={() => onCreateDiwan?.()}
        className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all"
        style={{
          color: "#C68E17",
          fontFamily: "var(--font-ui)",
          fontSize: "14px",
          fontWeight: 400,
          backgroundColor: "rgba(198, 142, 23, 0.08)",
          border: "1px solid rgba(198, 142, 23, 0.2)",
          marginBottom: 10,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.14)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.08)";
        }}
      >
        <IconPlus />
        <span>ابدأ محادثة</span>
      </button>

      {/* 3. ديوان — Start a group */}
      <button
        type="button"
        onClick={() => (onCreateGroup ?? onCreateDiwan)?.()}
        className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all"
        style={{
          color: "rgba(255,255,255,0.65)",
          fontFamily: "var(--font-ui)",
          fontSize: "14px",
          fontWeight: 400,
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 32,
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "rgba(255,255,255,0.65)";
        }}
      >
        <IconGroup />
        <span>ديوان</span>
      </button>

      {/* 4. قل ولاتقل — placeholder section */}
      <div
        className="shrink-0"
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(198,142,23,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(198,142,23,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 3,
            height: "100%",
            background: "linear-gradient(180deg, #C68E17 0%, transparent 100%)",
            borderRadius: "0 10px 10px 0",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(198,142,23,0.7)",
            textAlign: "right",
            letterSpacing: "0.02em",
          }}
        >
          قل ولاتقل
        </div>
        <div
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
            textAlign: "right",
            marginTop: 4,
          }}
        >
          قريباً
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* 5. Profile icon */}
      <div className="shrink-0" style={{ marginBottom: 12 }}>
        <UserProfile expanded={true} />
      </div>

      {/* 6. تحسين خليل — doc page at very bottom */}
      <Link
        href="/tahseen-khaleel"
        className="shrink-0 flex items-center justify-center gap-2 py-2 rounded-lg transition-opacity"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "12px",
          color: "rgba(255,255,255,0.25)",
          textDecoration: "none",
          opacity: 0.7,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(198,142,23,0.8)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "0.7";
          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)";
        }}
      >
        تحسين خليل
      </Link>
    </aside>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { ProfileIcon } from "../Icons/ProfileIcon";

export function UserProfile({ expanded }: { expanded: boolean }) {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name || session.user.email || "User";
  const userEmail = session.user.email;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center transition-opacity"
        style={{ 
          opacity: showMenu ? 1 : 0.7,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!showMenu) e.currentTarget.style.opacity = "0.7";
        }}
        title={userName}
      >
        <ProfileIcon size={32} className="text-white" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 transition-opacity"
        style={{ 
          opacity: showMenu ? 1 : 0.7,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!showMenu) e.currentTarget.style.opacity = "0.7";
        }}
      >
        <ProfileIcon size={40} className="text-white shrink-0" style={{ border: "1px solid #C68E17", borderRadius: "50%", padding: "2px" }} />
        <div className="flex-1 text-right overflow-hidden">
          <div 
            className="font-medium text-sm truncate" 
            style={{ 
              color: "rgba(255, 255, 255, 1)",
              fontFamily: "var(--font-ui)",
              fontWeight: 400,
            }}
          >
            {userName}
          </div>
          {userEmail && (
            <div 
              className="text-xs truncate" 
              style={{ 
                color: "rgba(255, 255, 255, 0.4)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "11px",
              }}
            >
              {userEmail}
            </div>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="absolute bottom-full left-0 right-0 mb-2 rounded-lg overflow-hidden z-20"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                signOut({ callbackUrl: "/signin" });
              }}
              className="w-full px-4 py-3 text-sm text-right transition-all"
              style={{ 
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "var(--font-ui)",
                fontWeight: 300,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
              }}
            >
              تسجيل الخروج
            </button>
          </div>
        </>
      )}
    </div>
  );
}

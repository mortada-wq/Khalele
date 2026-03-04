"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function UserProfile({ expanded }: { expanded: boolean }) {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const userInitial = session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U";
  const userName = session.user.name || session.user.email || "User";
  const userEmail = session.user.email;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center justify-center p-2 transition-colors"
        style={{ 
          color: "var(--text-primary)",
          backgroundColor: showMenu ? "rgba(0, 0, 0, 0.05)" : "transparent",
        }}
        title={userName}
        onMouseEnter={(e) => {
          if (!showMenu) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
        }}
        onMouseLeave={(e) => {
          if (!showMenu) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{
            background: "var(--color-accent)",
            color: "#FFFFFF",
          }}
        >
          {userInitial}
        </div>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 px-3 py-2.5 transition-all rounded-lg"
        style={{ 
          backgroundColor: showMenu ? "rgba(0, 0, 0, 0.08)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!showMenu) {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
          }
        }}
        onMouseLeave={(e) => {
          if (!showMenu) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
          style={{
            background: "var(--color-accent)",
            color: "#FFFFFF",
          }}
        >
          {userInitial}
        </div>
        <div className="flex-1 text-right overflow-hidden">
          <div 
            className="font-medium text-sm truncate" 
            style={{ 
              color: "var(--text-primary)",
              opacity: 1,
            }}
          >
            {userName}
          </div>
          {userEmail && (
            <div 
              className="text-xs truncate" 
              style={{ 
                color: "var(--text-secondary)",
                opacity: 1,
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
            color: "var(--text-primary)",
            opacity: 0.6,
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
            className="absolute bottom-full left-3 right-3 mb-2 rounded-lg shadow-lg overflow-hidden z-20"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                signOut({ callbackUrl: "/signin" });
              }}
              className="w-full px-4 py-2.5 text-sm text-right transition-colors"
              style={{ 
                color: "var(--text-primary)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
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

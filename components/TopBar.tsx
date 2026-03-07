"use client";

export interface TopBarProps {
  userRole?: "admin" | "user";
  showChatActions?: boolean;
  onShare?: () => void;
  onReport?: () => void;
}

export function TopBar({
  userRole,
}: TopBarProps) {
  return (
    <div
      className="top-bar shrink-0 flex items-center justify-end px-4 md:px-6"
      style={{ height: 52, background: "transparent", gap: "12px" }}
    >
      {/* Empty - Theme toggle moved to Sidebar */}
    </div>
  );
}

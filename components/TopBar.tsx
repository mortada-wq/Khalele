"use client";

import { Share2, FileText } from "lucide-react";

function UserAvatarIcon({ role }: { role?: "admin" | "user" }) {
  const isAdmin = role === "admin";
  return (
    <svg
      viewBox="0 0 33.5 39.75"
      width="28"
      height="33"
      className={isAdmin ? "admin-avatar-glow" : ""}
      style={{
        opacity: isAdmin ? 1 : 0.85,
        color: isAdmin ? "#D4A017" : "var(--color-accent-avatar-collapsed)",
      }}
    >
      <circle fill="currentColor" cx="16.75" cy="17.55" r="5.83" />
      <path
        stroke="currentColor"
        strokeWidth=".5"
        fill="none"
        d="M28.59,9.99c-2.88-3.56-6.76-6.48-10.76-9.49-.64-.48-1.52-.48-2.16,0C7.69,6.52.15,12.2.15,23.26c-.14,4.32,1.46,8.52,4.46,11.64.23.23.45.45.7.66,2.81,2.37,6.31,3.77,9.98,3.97.98.02,1.95.04,2.93.06h0c3.67-.22,7.17-1.61,9.98-3.99,3.38-2.97,5.16-7.24,5.16-12.33,0-5.55-1.88-9.74-4.77-13.3ZM27.41,31.2c-.29.38-.61.74-.95,1.07-1.78-5.35-7.56-8.25-12.91-6.47-2.87.95-5.17,3.13-6.28,5.95-.52-.48-.99-1.01-1.39-1.58-1.89-3.07-2.55-6.74-1.84-10.28,1.18-6.28,5.76-10.43,12.72-15.7,8.13,6.18,13.02,10.81,13.02,19.04.11,2.85-.72,5.65-2.36,7.97Z"
      />
    </svg>
  );
}

export interface TopBarProps {
  sidebarExpanded: boolean;
  onToggleSidebar?: () => void;
  onAvatarClick: () => void;
  onShare?: () => void;
  onReport?: () => void;
  userRole?: "admin" | "user";
  /** Show Share and Report (only when there's an active chat with messages) */
  showChatActions?: boolean;
}

export function TopBar({
  sidebarExpanded,
  onToggleSidebar,
  onAvatarClick,
  onShare,
  onReport,
  userRole,
  showChatActions = false,
}: TopBarProps) {
  return (
    <div
      className="top-bar shrink-0 flex items-center justify-between px-4 md:px-6"
      style={{ height: 52, background: "transparent" }}
    >
      {/* Left side (RTL: visual right) — Chat actions only */}
      <div className="flex items-center gap-4">
        {showChatActions && (
          <>
            <button
              type="button"
              onClick={onShare}
              className="top-bar-action"
              aria-label="مشاركة"
              title="مشاركة"
            >
              <Share2 size={20} strokeWidth={2} />
              <span className="top-bar-action-label">مشاركة</span>
            </button>
            <button
              type="button"
              onClick={onReport}
              className="top-bar-action"
              aria-label="تقرير الكلام"
              title="تقرير الكلام"
            >
              <FileText size={20} strokeWidth={2} />
              <span className="top-bar-action-label">تقرير الكلام</span>
            </button>
          </>
        )}
      </div>

      {/* Right side (RTL: visual left) — Profile + Mobile Menu */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button - only show on mobile when sidebar is collapsed */}
        {onToggleSidebar && !sidebarExpanded && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden top-bar-action"
            aria-label="فتح القائمة"
            title="فتح القائمة"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        
        <button
          type="button"
          onClick={onAvatarClick}
          className="top-bar-action shrink-0"
          aria-label="الحساب والإعدادات"
          title="الحساب والإعدادات"
        >
          <UserAvatarIcon role={userRole} />
          <span className="top-bar-action-label sr-only">الحساب</span>
        </button>
      </div>
    </div>
  );
}

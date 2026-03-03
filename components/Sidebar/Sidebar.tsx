"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BirdToggle } from "@/components/BirdToggle";
import { SidebarSection } from "./SidebarSection";
import { ExpandableList } from "./ExpandableList";
import { ConversationList } from "@/components/Chat/ConversationList";
import type { Conversation, DateGroup } from "@/lib/chat";

/* ── Constants ── */
const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;

/* ── Section icons (20×20 outline style) ── */
const iconSize = 20;
const iconProps = {
  width: iconSize,
  height: iconSize,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconStart() {
  return (
    <svg {...iconProps}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg {...iconProps}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconStudies() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/* ── User avatar (extracted from page.tsx) ── */
function UserAvatarIcon({
  expanded,
  role,
}: {
  expanded: boolean;
  role?: "admin" | "user";
}) {
  const isAdmin = role === "admin";
  const fillColor = isAdmin
    ? "#D4A017"
    : expanded
      ? "var(--color-accent-avatar-expanded)"
      : "var(--color-accent-avatar-collapsed)";
  const strokeEnd = isAdmin ? "#FFD700" : expanded ? "#fff" : "#ebebec";
  const gradientId = isAdmin
    ? "c-avatar-stroke-admin"
    : expanded
      ? "c-avatar-stroke-in"
      : "c-avatar-stroke-out";
  return (
    <svg
      viewBox="0 0 33.5 39.75"
      width="35"
      height="42"
      aria-hidden
      className={isAdmin ? "admin-avatar-glow" : ""}
      style={{ opacity: isAdmin ? 1 : 0.65, textAlign: "center" }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="19.87"
          x2="33.5"
          y2="19.87"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stopColor={isAdmin ? "#B8860B" : "#5e5e5e"}
            stopOpacity={isAdmin ? 1 : 0}
          />
          <stop offset="1" stopColor={strokeEnd} />
        </linearGradient>
      </defs>
      <circle fill={fillColor} cx="16.75" cy="17.55" r="5.83" />
      <path
        stroke={`url(#${gradientId})`}
        strokeMiterlimit="10"
        strokeWidth=".28"
        fill={isAdmin ? "#D4A017" : "none"}
        d="M28.59,9.99c-2.88-3.56-6.76-6.48-10.76-9.49-.64-.48-1.52-.48-2.16,0C7.69,6.52.15,12.2.15,23.26c-.14,4.32,1.46,8.52,4.46,11.64.23.23.45.45.7.66,2.81,2.37,6.31,3.77,9.98,3.97.98.02,1.95.04,2.93.06h0c3.67-.22,7.17-1.61,9.98-3.99,3.38-2.97,5.16-7.24,5.16-12.33,0-5.55-1.88-9.74-4.77-13.3ZM27.41,31.2c-.29.38-.61.74-.95,1.07-1.78-5.35-7.56-8.25-12.91-6.47-2.87.95-5.17,3.13-6.28,5.95-.52-.48-.99-1.01-1.39-1.58-1.89-3.07-2.55-6.74-1.84-10.28,1.18-6.28,5.76-10.43,12.72-15.7,8.13,6.18,13.02,10.81,13.02,19.04.11,2.85-.72,5.65-2.36,7.97Z"
      />
    </svg>
  );
}

/* ── Types ── */
export type SidebarActiveSection =
  | "start"
  | "reports"
  | "projects"
  | "studies";

export interface Report {
  id: string;
  title: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  memberCount: number;
  documentCount: number;
}

export interface Study {
  id: string;
  title: string;
  createdAt: string;
}

export interface SidebarProps {
  /* Data */
  conversations: Conversation[];
  currentConversationId: string | null;
  groupedConversations: Record<DateGroup, Conversation[]>;
  reports: Report[];
  projects: Project[];
  studies: Study[];
  /* User info */
  userDisplayName: string;
  activeNickname: string;
  userRole?: "admin" | "user";
  /* Callbacks */
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onAvatarClick: () => void;
  onSelectReport?: (id: string) => void;
  onSelectProject?: (id: string) => void;
  onCreateProject?: () => void;
  onSelectStudy?: (id: string) => void;
  onDeleteStudy?: (id: string) => void;
  onSearch?: (query: string) => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  groupedConversations,
  reports,
  projects,
  studies,
  userDisplayName,
  activeNickname,
  userRole,
  onNewChat,
  onSelectConversation,
  onAvatarClick,
  onSelectReport,
  onSelectProject,
  onCreateProject,
  onSelectStudy,
  onDeleteStudy,
  onSearch,
}: SidebarProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SidebarActiveSection>("start");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
      searchDebounce.current = setTimeout(() => {
        onSearch?.(q.trim());
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  /* Format date for list items */
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  /* ── Shared sidebar content (used by both desktop and mobile) ── */
  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* ── Part 2: ابدأ (Start) ── */}
      <SidebarSection
        icon={<IconStart />}
        label="ابدأ"
        expanded={isMobile || expanded}
        divider={false}
        active={activeSection === "start"}
        onClick={() => {
          setActiveSection("start");
          if (isMobile) {
            onNewChat();
            setMobileOpen(false);
          } else {
            onNewChat();
          }
        }}
      >
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="ابحث في المحادثات والتقارير..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl font-ui text-xs"
            style={{
              background: "var(--bg-tertiary)",
              border: "var(--border-subtle)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Chat archive */}
        <div>
          <p
            className="px-1 pb-1.5 font-ui text-[11px]"
            style={{ color: "var(--text-tertiary)", fontWeight: 600 }}
          >
            المحادثات
          </p>
          <ExpandableList
            items={conversations}
            initialCount={3}
            emptyMessage="لا توجد محادثات بعد"
            renderItem={(conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  if (isMobile) setMobileOpen(false);
                }}
                className="w-full text-right px-3 py-2 rounded-lg font-ui text-xs truncate block transition-colors"
                style={{
                  color:
                    currentConversationId === conv.id
                      ? "var(--color-accent)"
                      : "var(--text-primary)",
                  background:
                    currentConversationId === conv.id
                      ? "var(--color-accent-tint-10)"
                      : "transparent",
                }}
              >
                {conv.title || "محادثة جديدة"}
              </button>
            )}
          />
        </div>
      </SidebarSection>

      {/* ── Part 3: تقارير (Reports) ── */}
      <SidebarSection
        icon={<IconReports />}
        label="تقارير"
        expanded={isMobile || expanded}
        active={activeSection === "reports"}
        onClick={() => setActiveSection("reports")}
      >
        <ExpandableList
          items={reports}
          initialCount={3}
          emptyMessage="لا توجد تقارير بعد"
          renderItem={(report) => (
            <button
              key={report.id}
              onClick={() => {
                onSelectReport?.(report.id);
                if (isMobile) setMobileOpen(false);
              }}
              className="w-full text-right px-3 py-2 rounded-lg font-ui text-xs truncate block transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="block truncate">{report.title}</span>
              <span
                className="block text-[10px] mt-0.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                {fmtDate(report.createdAt)}
              </span>
            </button>
          )}
        />
      </SidebarSection>

      {/* ── Part 4: خليلخانة (Projects) ── */}
      <SidebarSection
        icon={<IconProjects />}
        label="خليلخانة"
        expanded={isMobile || expanded}
        active={activeSection === "projects"}
        onClick={() => setActiveSection("projects")}
      >
        {onCreateProject && (
          <button
            type="button"
            onClick={() => {
              onCreateProject();
              if (isMobile) setMobileOpen(false);
            }}
            className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>مشروع جديد</span>
          </button>
        )}
        <ExpandableList
          items={projects}
          initialCount={3}
          emptyMessage="لا توجد مشاريع بعد"
          renderItem={(project) => (
            <button
              key={project.id}
              onClick={() => {
                onSelectProject?.(project.id);
                if (isMobile) setMobileOpen(false);
              }}
              className="w-full text-right px-3 py-2 rounded-lg font-ui text-xs truncate block transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="block truncate">{project.name}</span>
              <span
                className="block text-[10px] mt-0.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                {project.memberCount > 0 &&
                  `${project.memberCount} عضو`}
                {project.memberCount > 0 &&
                  project.documentCount > 0 &&
                  " · "}
                {project.documentCount > 0 &&
                  `${project.documentCount} ملف`}
              </span>
            </button>
          )}
        />
      </SidebarSection>

      {/* ── Part 5: قضايا (Studies) ── */}
      <SidebarSection
        icon={<IconStudies />}
        label="قضايا"
        expanded={isMobile || expanded}
        active={activeSection === "studies"}
        onClick={() => setActiveSection("studies")}
      >
        <ExpandableList
          items={studies}
          initialCount={3}
          emptyMessage="لا توجد قضايا بعد"
          renderItem={(study) => (
            <div
              key={study.id}
              className="flex items-center gap-1 group"
            >
              <button
                onClick={() => {
                  onSelectStudy?.(study.id);
                  if (isMobile) setMobileOpen(false);
                }}
                className="flex-1 min-w-0 text-right px-3 py-2 rounded-lg font-ui text-xs truncate block transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--text-primary)" }}
              >
                <span className="block truncate">{study.title}</span>
                <span
                  className="block text-[10px] mt-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {fmtDate(study.createdAt)}
                </span>
              </button>
              {onDeleteStudy && (
                <button
                  type="button"
                  onClick={() => onDeleteStudy(study.id)}
                  className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ color: "var(--text-tertiary)" }}
                  title="حذف"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          )}
        />
      </SidebarSection>
    </>
  );

  /* ── User footer ── */
  const userFooter = (isMobile: boolean) =>
    expanded || isMobile ? (
      <div
        className="shrink-0 pb-4 pt-2 px-3"
        style={{ borderTop: "var(--border-subtle)" }}
      >
        <button
          onClick={() => {
            onAvatarClick();
            if (isMobile) setMobileOpen(false);
          }}
          className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-black/5 transition-colors"
          aria-label="الحساب والإعدادات"
        >
          <UserAvatarIcon expanded={true} role={userRole} />
          <div className="min-w-0 text-right">
            <p
              className="font-ui text-xs font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {activeNickname || userDisplayName}
            </p>
            <p
              className="font-ui text-[11px] truncate"
              style={{ color: "var(--text-tertiary)" }}
            >
              {activeNickname
                ? userDisplayName
                : "اضغط لفتح الإعدادات"}
            </p>
          </div>
        </button>
      </div>
    ) : (
      <div
        className="shrink-0 flex flex-col items-center gap-2 pb-4 pt-2"
        style={{
          width: SIDEBAR_W_COLLAPSED,
          marginInlineEnd: "auto",
        }}
      >
        <button
          onClick={onAvatarClick}
          className="flex items-center justify-center pt-1 rounded-lg hover:bg-black/5 transition-colors p-1"
          aria-label="الحساب والإعدادات"
        >
          <UserAvatarIcon expanded={expanded} role={userRole} />
        </button>
      </div>
    );

  return (
    <>
      {/* ═══════ Desktop sidebar ═══════ */}
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: expanded
            ? "var(--bg-secondary)"
            : "var(--bg-tertiary)",
          borderTopLeftRadius: expanded ? 20 : 0,
          transition:
            "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}
      >
        {/* Bird toggle */}
        <div className="shrink-0" style={{ height: 72 }}>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="absolute flex items-center justify-center outline-none focus:outline-none"
            style={{
              top: 0,
              right: 0,
              width: SIDEBAR_W_COLLAPSED,
              height: 72,
            }}
            aria-label={expanded ? "طي القائمة" : "فتح القائمة"}
          >
            <BirdToggle expanded={expanded} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto sidebar-scroll">
          {expanded ? (
            <div className="flex-1 min-h-0 px-1 py-2">
              {sidebarContent(false)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-1 pt-2">
              {/* Collapsed: icon-only buttons */}
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setActiveSection("start");
                }}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="ابدأ"
                style={{
                  color:
                    activeSection === "start"
                      ? "var(--color-accent)"
                      : "var(--text-tertiary)",
                }}
              >
                <IconStart />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setActiveSection("reports");
                }}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="تقارير"
                style={{
                  color:
                    activeSection === "reports"
                      ? "var(--color-accent)"
                      : "var(--text-tertiary)",
                }}
              >
                <IconReports />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setActiveSection("projects");
                }}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="خليلخانة"
                style={{
                  color:
                    activeSection === "projects"
                      ? "var(--color-accent)"
                      : "var(--text-tertiary)",
                }}
              >
                <IconProjects />
              </button>
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  setActiveSection("studies");
                }}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="قضايا"
                style={{
                  color:
                    activeSection === "studies"
                      ? "var(--color-accent)"
                      : "var(--text-tertiary)",
                }}
              >
                <IconStudies />
              </button>
            </div>
          )}
        </div>

        {userFooter(false)}
      </aside>

      {/* ═══════ Mobile bird toggle ═══════ */}
      <button
        type="button"
        onClick={() => setMobileOpen((p) => !p)}
        className="md:hidden fixed top-4 z-[60] flex items-center justify-center p-3 rounded-xl bg-transparent border-none shadow-none hover:opacity-80 active:opacity-70 transition-opacity touch-manipulation outline-none focus:outline-none"
        style={{ right: 12 }}
        aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        <BirdToggle expanded={mobileOpen} size={40} />
      </button>

      {/* ═══════ Mobile sidebar ═══════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{ width: "min(320px,85vw)" }}
            exit={{ width: 0 }}
            transition={{
              type: "tween",
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="md:hidden shrink-0 flex flex-col overflow-hidden"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div className="shrink-0" style={{ height: 72 }} />
            <div className="flex-1 overflow-y-auto sidebar-scroll px-1 py-2">
              {sidebarContent(true)}
            </div>
            {userFooter(true)}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

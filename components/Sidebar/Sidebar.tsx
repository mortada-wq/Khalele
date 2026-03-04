"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BirdToggle } from "@/components/BirdToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "./UserProfile";
import type { Conversation } from "@/lib/chat";

const SIDEBAR_W_EXPANDED = 300;
const SIDEBAR_W_COLLAPSED = 72;

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

function IconDirectory() {
  return (
    <svg {...iconProps}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="12" y1="7" x2="17" y2="7" />
      <line x1="12" y1="12" x2="17" y2="12" />
      <line x1="12" y1="17" x2="17" y2="17" />
      <circle cx="9" cy="7" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="17" r="1" />
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

function IconMoreHorizontal() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export interface Contact {
  id: string;
  name: string;
  code: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  preview?: string;
  createdAt?: string;
}

export interface Study {
  id: string;
  title: string;
  createdAt: string;
}

export interface SidebarProps {
  expanded: boolean;
  onClose?: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  contacts: Contact[];
  projects: Project[];
  studies: Study[];
  onSelectConversation: (id: string) => void;
  onCreateDiwan?: () => void;
  onSelectContact?: (id: string) => void;
  onSelectProject?: (id: string) => void;
  onCreateProject?: () => void;
  onOpenDefater?: () => void;
  onSelectStudy?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onRenameProject?: (id: string, title: string) => void;
  onRenameStudy?: (id: string, title: string) => void;
  onSearchDirectory?: (query: string) => void;
  onSearchCases?: (query: string) => void;
  onToggleSidebar?: () => void;
  notificationCount?: number;
}

type ActiveSection = "diwan" | "directory" | "projects" | "studies" | null;

export function Sidebar({
  expanded,
  onClose,
  conversations,
  currentConversationId,
  contacts,
  projects,
  studies,
  onSelectConversation,
  onCreateDiwan,
  onSelectContact,
  onSelectProject,
  onCreateProject,
  onOpenDefater,
  onSelectStudy,
  // onRenameConversation,
  // onRenameProject,
  // onRenameStudy,
  onSearchDirectory,
  onSearchCases,
  onToggleSidebar,
  notificationCount = 0,
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [showAllDiwans, setShowAllDiwans] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [casesSearch, setCasesSearch] = useState("");

  // Get most recent diwan
  const mostRecentDiwan = conversations[0];
  const olderDiwans = conversations.slice(1);

  const toggleSection = (section: ActiveSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Sections - scrollable content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll" style={{ minHeight: 0 }}>
        {/* ديوان Section */}
        <div className="mb-1">
          <button
            type="button"
            onClick={() => toggleSection("diwan")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 font-ui text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              color: activeSection === "diwan" ? "var(--color-accent)" : "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            <IconGroup />
            {expanded && <span>ديوان</span>}
          </button>
          
          {expanded && activeSection === "diwan" && (
            <div className="px-3 py-2 sidebar-section-content">
              {/* افرش بساطك button */}
              <button
                type="button"
                onClick={() => {
                  onCreateDiwan?.();
                  if (isMobile) onClose?.();
                }}
                className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-2"
                style={{ color: "var(--color-accent)" }}
              >
                <IconPlus />
                <span>افرش بساطك</span>
              </button>

              {/* Most recent diwan */}
              {mostRecentDiwan && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectConversation(mostRecentDiwan.id);
                    if (isMobile) onClose?.();
                  }}
                  className={`sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                    currentConversationId === mostRecentDiwan.id ? "bg-black/5 dark:bg-white/5" : ""
                  }`}
                  style={{ color: "var(--text-primary)" }}
                >
                  <IconGroup />
                  <span className="flex-1 text-right truncate">{mostRecentDiwan.title || "ديوان جديد"}</span>
                </button>
              )}

              {/* Older diwans - collapsed into ... */}
              {olderDiwans.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAllDiwans(!showAllDiwans)}
                    className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <IconMoreHorizontal />
                    <span>{showAllDiwans ? "إخفاء" : `${olderDiwans.length} ديوان آخر`}</span>
                  </button>

                  {showAllDiwans && (
                    <div className="mt-1 space-y-1">
                      {olderDiwans.map((conv, idx) => (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => {
                            onSelectConversation(conv.id);
                            if (isMobile) onClose?.();
                          }}
                          className={`sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                            currentConversationId === conv.id ? "bg-black/5 dark:bg-white/5" : ""
                          }`}
                          style={{ 
                            color: "var(--text-primary)",
                            animationDelay: `${0.05 + idx * 0.03}s`
                          }}
                        >
                          <IconGroup />
                          <span className="flex-1 text-right truncate">{conv.title || "ديوان جديد"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* دليل Section */}
        <div className="mb-1">
          <button
            type="button"
            onClick={() => toggleSection("directory")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 font-ui text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              color: activeSection === "directory" ? "var(--color-accent)" : "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            <IconDirectory />
            {expanded && <span>دليل</span>}
          </button>

          {expanded && activeSection === "directory" && (
            <div className="px-3 py-2 sidebar-section-content">
              <input
                type="text"
                placeholder="ابحث..."
                value={directorySearch}
                onChange={(e) => {
                  setDirectorySearch(e.target.value);
                  onSearchDirectory?.(e.target.value);
                }}
                className="sidebar-item w-full px-3 py-2 rounded-lg font-ui text-xs mb-2"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              {contacts.map((contact, idx) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    onSelectContact?.(contact.id);
                    if (isMobile) onClose?.();
                  }}
                  className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ 
                    color: "var(--text-primary)",
                    animationDelay: `${0.05 + idx * 0.03}s`
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div className="flex-1 text-right">
                    <div className="truncate">{contact.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{contact.code}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* دفاتر Section */}
        <div className="mb-1">
          <button
            type="button"
            onClick={() => toggleSection("projects")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 font-ui text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              color: activeSection === "projects" ? "var(--color-accent)" : "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            <IconProjects />
            {expanded && <span>دفاتر</span>}
          </button>

          {expanded && activeSection === "projects" && (
            <div className="px-3 py-2 sidebar-section-content">
              {onOpenDefater && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDefater();
                    if (isMobile) onClose?.();
                  }}
                  className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-1"
                  style={{ color: "var(--color-accent)" }}
                >
                  <IconPlus />
                  <span>دفتر سريع</span>
                </button>
              )}
              {onCreateProject && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateProject();
                    if (isMobile) onClose?.();
                  }}
                  className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <IconPlus />
                  <span>دفتر جديد</span>
                </button>
              )}
              {projects.map((project, idx) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onSelectProject?.(project.id);
                    if (isMobile) onClose?.();
                  }}
                  className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ 
                    color: "var(--text-primary)",
                    animationDelay: `${0.08 + idx * 0.03}s`
                  }}
                >
                  <IconProjects />
                  <span className="flex-1 text-right truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* قضايا Section */}
        <div className="mb-1">
          <button
            type="button"
            onClick={() => toggleSection("studies")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 font-ui text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              color: activeSection === "studies" ? "var(--color-accent)" : "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            <IconStudies />
            {expanded && <span>قضايا</span>}
          </button>

          {expanded && activeSection === "studies" && (
            <div className="px-3 py-2 sidebar-section-content">
              <input
                type="text"
                placeholder="ابحث..."
                value={casesSearch}
                onChange={(e) => {
                  setCasesSearch(e.target.value);
                  onSearchCases?.(e.target.value);
                }}
                className="sidebar-item w-full px-3 py-2 rounded-lg font-ui text-xs mb-2"
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              {studies.map((study, idx) => (
                <button
                  key={study.id}
                  type="button"
                  onClick={() => {
                    onSelectStudy?.(study.id);
                    if (isMobile) onClose?.();
                  }}
                  className="sidebar-item w-full flex items-center gap-2 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ 
                    color: "var(--text-primary)",
                    animationDelay: `${0.05 + idx * 0.03}s`
                  }}
                >
                  <IconStudies />
                  <span className="flex-1 text-right truncate">{study.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile and Theme toggle - PINNED TO BOTTOM - FLOATING */}
      <div className="shrink-0 mt-auto" style={{ paddingTop: "40px" }}>
        {/* User Profile - No borders, floating */}
        <div style={{ marginBottom: "24px" }}>
          <UserProfile expanded={expanded} />
        </div>
        
        {/* Theme toggle */}
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - FULL HEIGHT */}
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          height: "100vh",
          background: expanded ? "#121212" : "transparent",
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
          padding: expanded ? "32px" : "16px",
        }}
      >
        {/* Bird at absolute top - INSIDE SIDEBAR */}
        <div className="shrink-0 flex items-center" style={{ height: 52, marginBottom: expanded ? "24px" : "16px" }}>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="relative flex items-center justify-center transition-colors"
              aria-label={expanded ? "طي القائمة" : "فتح القائمة"}
            >
              <BirdToggle expanded={expanded} size={48} />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ابدأ Button directly under bird - INSIDE SIDEBAR */}
        {onCreateDiwan && (
          <div className="shrink-0" style={{ marginBottom: expanded ? "40px" : "24px" }}>
            {expanded ? (
              <button
                type="button"
                onClick={() => onCreateDiwan()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all"
                style={{ 
                  color: "#C68E17",
                  fontFamily: "var(--font-ui)",
                  fontSize: "14px",
                  fontWeight: 300,
                  backgroundColor: "rgba(198, 142, 23, 0.08)",
                  border: "1px solid rgba(198, 142, 23, 0.2)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.08)";
                }}
                title="ديوان جديد"
              >
                <IconPlus />
                <span>ابدأ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onCreateDiwan()}
                className="w-full flex items-center justify-center p-3 rounded-lg transition-all"
                style={{ 
                  color: "#C68E17",
                  backgroundColor: "rgba(198, 142, 23, 0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(198, 142, 23, 0.08)";
                }}
                title="ابدأ"
              >
                <IconPlus />
              </button>
            )}
          </div>
        )}

        {expanded ? (
          sidebarContent(false)
        ) : (
          <div className="flex-1 flex flex-col items-center gap-1 pt-2">
            {/* Collapsed state - icon-only buttons */}
            <button
              type="button"
              onClick={() => toggleSection("diwan")}
              className="p-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              title="ديوان"
              style={{ color: activeSection === "diwan" ? "var(--color-accent)" : "var(--text-tertiary)" }}
            >
              <IconGroup />
            </button>
            <button
              type="button"
              onClick={() => toggleSection("directory")}
              className="p-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              title="دليل"
              style={{ color: activeSection === "directory" ? "var(--color-accent)" : "var(--text-tertiary)" }}
            >
              <IconDirectory />
            </button>
            <button
              type="button"
              onClick={() => toggleSection("projects")}
              className="p-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              title="دفاتر"
              style={{ color: activeSection === "projects" ? "var(--color-accent)" : "var(--text-tertiary)" }}
            >
              <IconProjects />
            </button>
            <button
              type="button"
              onClick={() => toggleSection("studies")}
              className="p-2.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              title="قضايا"
              style={{ color: activeSection === "studies" ? "var(--color-accent)" : "var(--text-tertiary)" }}
            >
              <IconStudies />
            </button>

            {/* Spacer to push profile to bottom */}
            <div className="flex-1" />

            {/* User Profile - collapsed state - FLOATING */}
            <div className="shrink-0 w-full" style={{ marginTop: "24px" }}>
              <UserProfile expanded={false} />
            </div>

            {/* Theme toggle - collapsed state */}
            <div className="shrink-0 w-full" style={{ marginTop: "16px" }}>
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile drawer - FULL HEIGHT */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 z-30"
              style={{ background: "rgba(0,0,0,0.3)" }}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-40 flex flex-col overflow-hidden"
              style={{ 
                width: "min(320px, 85vw)",
                background: "var(--bg-secondary)",
              }}
            >
              {/* Bird at top of mobile drawer */}
              <div className="shrink-0 flex items-center ps-3 border-b" style={{ height: 52, borderColor: "var(--border-subtle)" }}>
                {onToggleSidebar && (
                  <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="relative flex items-center justify-center p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <BirdToggle expanded={true} size={43} />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-bold">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* ابدأ button in mobile */}
              {onCreateDiwan && (
                <div className="shrink-0 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      onCreateDiwan();
                      onClose?.();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-ui text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <IconPlus />
                    <span>ابدأ</span>
                  </button>
                </div>
              )}

              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

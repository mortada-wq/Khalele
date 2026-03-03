"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarSection } from "./SidebarSection";
import { ExpandableList } from "./ExpandableList";
import { EditableSidebarItem } from "./EditableSidebarItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Conversation, DateGroup } from "@/lib/chat";

const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;

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

function IconSearch() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

export type SidebarActiveSection =
  | "diwan"
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
  memberCount?: number;
  documentCount?: number;
  /** First line preview (for notebooks) */
  preview?: string;
  /** ISO date (for notebooks) */
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
  groupedConversations?: Record<DateGroup, Conversation[]>;
  reports: Report[];
  projects: Project[];
  studies: Study[];
  stealthMode: boolean;
  onStealthChange: (v: boolean) => void;
  onSelectConversation: (id: string) => void;
  onSelectReport?: (id: string) => void;
  onSelectProject?: (id: string) => void;
  onCreateProject?: () => void;
  onOpenDefater?: () => void;
  onSelectStudy?: (id: string) => void;
  onDeleteStudy?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onRenameReport?: (id: string, title: string) => void;
  onRenameProject?: (id: string, title: string) => void;
  onRenameStudy?: (id: string, title: string) => void;
  onSearch?: (query: string) => void;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

const FEEDBACK_LINK = "mailto:hello@kheleel.com?subject=تحسين خليل";

export function Sidebar({
  expanded,
  onClose,
  conversations,
  currentConversationId,
  reports,
  projects,
  studies,
  stealthMode,
  onStealthChange,
  onSelectConversation,
  onSelectReport,
  onSelectProject,
  onCreateProject,
  onOpenDefater,
  onSelectStudy,
  onDeleteStudy,
  onRenameConversation,
  onRenameReport,
  onRenameProject,
  onRenameStudy,
  onSearch,
}: SidebarProps) {
  const [activeSection, setActiveSection] =
    useState<SidebarActiveSection>("diwan");
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

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Part 2: Search + Chat archive + ديوان (Groups) */}
      <SidebarSection
        icon={<IconGroup />}
        label="ديوان"
        expanded={isMobile || expanded}
        divider={false}
        active={activeSection === "diwan"}
        onClick={() => setActiveSection("diwan")}
      >
        <div className="mb-3">
          <input
            type="text"
            placeholder="ابحث..."
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
        <div>
          <ExpandableList
            items={conversations}
            initialCount={3}
            emptyMessage="لا محادثات"
            renderItem={(conv) => (
              <EditableSidebarItem
                key={conv.id}
                id={conv.id}
                title={conv.title || "محادثة جديدة"}
                isSelected={currentConversationId === conv.id}
                onSelect={() => {
                  onSelectConversation(conv.id);
                  if (isMobile) onClose?.();
                }}
                onRename={onRenameConversation}
                canEdit={!!onRenameConversation}
              />
            )}
          />
        </div>
      </SidebarSection>

      {/* Part 3: م/موضوع (Reports) */}
      <SidebarSection
        icon={<IconReports />}
        label="م/موضوع"
        expanded={isMobile || expanded}
        active={activeSection === "reports"}
        onClick={() => setActiveSection("reports")}
      >
        <ExpandableList
          items={reports}
          initialCount={3}
          emptyMessage="لا تقارير"
          renderItem={(report) => (
            <EditableSidebarItem
              key={report.id}
              id={report.id}
              title={report.title}
              subtitle={fmtDate(report.createdAt)}
              onSelect={() => {
                onSelectReport?.(report.id);
                if (isMobile) onClose?.();
              }}
              onRename={onRenameReport}
              canEdit={!!onRenameReport}
            />
          )}
        />
      </SidebarSection>

      {/* Part 4: دفاتر (Projects) */}
      <SidebarSection
        icon={<IconProjects />}
        label="دفاتر"
        expanded={isMobile || expanded}
        active={activeSection === "projects"}
        onClick={() => setActiveSection("projects")}
      >
        {onOpenDefater && (
          <button
            type="button"
            onClick={() => {
              onOpenDefater();
              if (isMobile) onClose?.();
            }}
            className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-1"
            style={{ color: "var(--color-accent)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
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
            className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>دفتر جديد</span>
          </button>
        )}
        <ExpandableList
          items={projects}
          initialCount={3}
          emptyMessage="لا دفاتر"
          renderItem={(project) => (
            <EditableSidebarItem
              key={project.id}
              id={project.id}
              title={project.name}
              subtitle={
                project.preview ? `${project.preview} · ` : "" +
                (project.createdAt ? fmtDate(project.createdAt) : "") +
                (!project.createdAt && (project.memberCount ?? 0) > 0 ? `${project.memberCount} عضو` : "") +
                (!project.createdAt && (project.documentCount ?? 0) > 0 ? ` · ${project.documentCount} ملف` : "")
              }
              onSelect={() => {
                onSelectProject?.(project.id);
                if (isMobile) onClose?.();
              }}
              onRename={onRenameProject}
              canEdit={!!onRenameProject}
            />
          )}
        />
      </SidebarSection>

      {/* Part 5: Stealth + Theme toggles */}
      <div>
        <div className="sidebar-divider" />
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 font-ui text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              checked={stealthMode}
              onChange={(e) => onStealthChange(e.target.checked)}
              className="rounded accent-accent"
            />
            <span>وضع خاص</span>
          </label>
          <ThemeToggle />
        </div>
      </div>

      {/* Part 6: قضايا (Studies) */}
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
          emptyMessage="لا قضايا"
          renderItem={(study) => (
            <EditableSidebarItem
              key={study.id}
              id={study.id}
              title={study.title}
              subtitle={fmtDate(study.createdAt)}
              onSelect={() => {
                onSelectStudy?.(study.id);
                if (isMobile) onClose?.();
              }}
              onRename={onRenameStudy}
              canEdit={!!onRenameStudy}
              actions={
                onDeleteStudy ? (
                  <button
                    type="button"
                    onClick={() => onDeleteStudy(study.id)}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-60 transition-opacity hover:opacity-100"
                    style={{ color: "var(--text-tertiary)" }}
                    title="حذف"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                ) : undefined
              }
            />
          )}
        />
      </SidebarSection>

      {/* Part 7: تحسين خليل */}
      <div>
        <div className="sidebar-divider" />
        <a
          href={FEEDBACK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 font-ui text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>تحسين خليل</span>
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex relative shrink-0 flex-col overflow-hidden"
        style={{
          width: expanded ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED,
          background: expanded ? "var(--bg-secondary)" : "var(--bg-tertiary)",
          borderTopLeftRadius: expanded ? 20 : 0,
          transition:
            "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10,
        }}
      >
        <div className="shrink-0" style={{ height: 52 }} />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto sidebar-scroll">
          {expanded ? (
            <div className="flex-1 min-h-0 px-1 py-2">
              {sidebarContent(false)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-1 pt-2">
              <button
                type="button"
                onClick={() => setActiveSection("diwan")}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="ديوان"
                style={{
                  color: activeSection === "diwan" ? "var(--color-accent)" : "var(--text-tertiary)",
                }}
              >
                <IconSearch />
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("reports")}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="م/موضوع"
                style={{
                  color: activeSection === "reports" ? "var(--color-accent)" : "var(--text-tertiary)",
                }}
              >
                <IconReports />
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("projects")}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="دفاتر"
                style={{
                  color: activeSection === "projects" ? "var(--color-accent)" : "var(--text-tertiary)",
                }}
              >
                <IconProjects />
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("studies")}
                className="sidebar-section-icon p-2.5 rounded-lg transition-colors hover:bg-black/5"
                title="قضايا"
                style={{
                  color: activeSection === "studies" ? "var(--color-accent)" : "var(--text-tertiary)",
                }}
              >
                <IconStudies />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile drawer — shown when expanded on mobile */}
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
              aria-hidden
            />
            <motion.aside
            initial={{ width: 0 }}
            animate={{ width: "min(320px,85vw)" }}
            exit={{ width: 0 }}
            transition={{ type: "tween", duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed inset-y-0 right-0 z-40 flex flex-col overflow-hidden"
            style={{ background: "var(--bg-secondary)", top: 52 }}
          >
            <div className="flex-1 overflow-y-auto sidebar-scroll px-1 py-2">
              {sidebarContent(true)}
            </div>
          </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

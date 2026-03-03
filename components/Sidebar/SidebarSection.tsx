"use client";

interface SidebarSectionProps {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  children?: React.ReactNode;
  /** Show thin divider above this section */
  divider?: boolean;
  /** Called when the section icon/label row is clicked */
  onClick?: () => void;
  /** Tooltip text for collapsed mode */
  tooltip?: string;
  /** Whether this is the active/selected section */
  active?: boolean;
}

export function SidebarSection({
  icon,
  label,
  expanded,
  children,
  divider = true,
  onClick,
  tooltip,
  active,
}: SidebarSectionProps) {
  return (
    <div>
      {divider && <div className="sidebar-divider" />}
      <button
        type="button"
        onClick={onClick}
        className={`sidebar-section-header w-full flex items-center gap-2.5 font-ui transition-colors${active ? " is-active" : ""}`}
        style={{
          padding: expanded ? "10px 16px" : "10px 0",
          justifyContent: expanded ? "flex-start" : "center",
          background: "transparent",
          border: "none",
          color: active
            ? "var(--color-accent)"
            : "var(--text-primary)",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: onClick ? "pointer" : "default",
        }}
        title={!expanded ? tooltip || label : undefined}
      >
        <span
          className="sidebar-section-icon shrink-0"
          style={{
            color: active
              ? "var(--color-accent)"
              : "var(--text-tertiary)",
          }}
        >
          {icon}
        </span>
        {expanded && <span>{label}</span>}
      </button>
      {expanded && children && (
        <div className="px-3 pb-2">{children}</div>
      )}
    </div>
  );
}

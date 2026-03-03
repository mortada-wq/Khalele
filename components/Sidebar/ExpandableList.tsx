"use client";

import { useState } from "react";

interface ExpandableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  initialCount?: number;
  emptyMessage?: string;
}

export function ExpandableList<T>({
  items,
  renderItem,
  initialCount = 3,
  emptyMessage,
}: ExpandableListProps<T>) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <div>
      {visible.map((item, i) => renderItem(item, i))}
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="expandable-dots w-full flex items-center justify-center py-2 font-ui text-xs transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span className="tracking-[0.3em]">...</span>
        </button>
      )}
      {expanded && hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="expandable-dots w-full flex items-center justify-center py-1.5 font-ui text-[10px] transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          أقل
        </button>
      )}
    </div>
  );
}

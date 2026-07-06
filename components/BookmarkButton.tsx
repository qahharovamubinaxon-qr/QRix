"use client";

import { useEffect, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import { isBookmarked, toggleBookmark, type ToolRef } from "@/lib/user-prefs";
import { toast } from "@/lib/toast";

/** Bookmark toggle for blog articles. */
export default function BookmarkButton({ item }: { item: ToolRef }) {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(isBookmarked(item.href)); }, [item.href]);
  return (
    <button onClick={() => { toggleBookmark(item); const n = !on; setOn(n); toast.success(n ? "Bookmarked" : "Bookmark removed"); }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors"
      style={{ background: on ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${on ? "var(--primary-bright)" : "var(--border)"}`, color: on ? "var(--primary-bright)" : "var(--text-muted)" }}
      aria-pressed={on}>
      <FiBookmark size={13} style={{ fill: on ? "currentColor" : "transparent" }} /> {on ? "Saved" : "Save"}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { isFavorite, toggleFavorite, type ToolRef } from "@/lib/user-prefs";
import { toast } from "@/lib/toast";

/** Heart toggle for tool pages. Records to localStorage favorites. */
export default function FavoriteButton({ tool }: { tool: ToolRef }) {
  const [on, setOn] = useState(false);
  const [pop, setPop] = useState(false);
  useEffect(() => { setOn(isFavorite(tool.href)); }, [tool.href]);

  return (
    <button
      onClick={() => {
        toggleFavorite(tool);
        const next = !on; setOn(next);
        setPop(true); setTimeout(() => setPop(false), 360);
        toast.success(next ? "Added to favorites" : "Removed from favorites");
      }}
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
      style={{ background: on ? "color-mix(in srgb, var(--danger) 14%, transparent)" : "var(--surface-2)", border: `1px solid ${on ? "color-mix(in srgb, var(--danger) 40%, transparent)" : "var(--border)"}`, color: on ? "#f87171" : "var(--text-muted)" }}
      aria-pressed={on} aria-label={on ? "Remove from favorites" : "Add to favorites"} title="Favorite">
      <FiHeart size={17} className={pop ? "qx-fav-pop" : ""} style={{ fill: on ? "#f87171" : "transparent" }} />
    </button>
  );
}

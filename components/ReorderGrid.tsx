"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

/* eslint-disable @next/next/no-img-element */

export type ReorderItem = { id: string; thumb: string; label: string };

export default function ReorderGrid({ items, onChange }: { items: ReorderItem[]; onChange: (items: ReorderItem[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function move(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const arr = [...items];
    const from = arr.findIndex((i) => i.id === dragId);
    const to = arr.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return;
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    onChange(arr);
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {items.map((it, idx) => (
        <div
          key={it.id}
          draggable
          onDragStart={() => setDragId(it.id)}
          onDragEnd={() => { setDragId(null); setOverId(null); }}
          onDragOver={(e) => { e.preventDefault(); if (overId !== it.id) setOverId(it.id); }}
          onDrop={() => { move(it.id); setOverId(null); }}
          className="relative rounded-xl overflow-hidden select-none transition-transform"
          style={{
            cursor: "grab",
            border: overId === it.id ? "2px solid #F58F20" : "1px solid var(--border)",
            background: "#fff",
            opacity: dragId === it.id ? 0.45 : 1,
            transform: overId === it.id && dragId !== it.id ? "scale(1.04)" : "none",
            boxShadow: "0 2px 10px rgba(0,0,0,.15)",
          }}
        >
          <span className="absolute top-1.5 left-1.5 z-10 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md" style={{ background: "#F58F20", color: "#0c0c0c" }}>{idx + 1}</span>
          <button onClick={() => onChange(items.filter((x) => x.id !== it.id))}
            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.6)", color: "#fff" }} aria-label="Remove">
            <FiX size={11} />
          </button>
          <img src={it.thumb} alt={it.label} className="w-full object-contain pointer-events-none" style={{ height: 124, background: "#f3f4f6" }} />
          <div className="text-[10px] truncate px-2 py-1.5" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

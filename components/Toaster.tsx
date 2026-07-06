"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiLoader, FiX } from "react-icons/fi";
import type { ToastMsg, ToastKind } from "@/lib/toast";

const ICON: Record<ToastKind, React.ReactNode> = {
  success: <FiCheckCircle size={17} />, error: <FiXCircle size={17} />,
  warning: <FiAlertTriangle size={17} />, info: <FiInfo size={17} />,
  loading: <FiLoader size={17} className="animate-spin" />,
};
const COLOR: Record<ToastKind, string> = {
  success: "#34d399", error: "#f87171", warning: "#fbbf24", info: "#60a5fa", loading: "var(--primary-bright)",
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const add = (e: Event) => {
      const t = (e as CustomEvent).detail as ToastMsg;
      setToasts((cur) => [...cur, t]);
      if (t.ttl < 900000) setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== t.id)), t.ttl);
    };
    const rm = (e: Event) => { const id = (e as CustomEvent).detail as string; setToasts((cur) => cur.filter((x) => x.id !== id)); };
    window.addEventListener("qrix-toast", add);
    window.addEventListener("qrix-toast-dismiss", rm);
    return () => { window.removeEventListener("qrix-toast", add); window.removeEventListener("qrix-toast-dismiss", rm); };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="fixed z-[300] bottom-5 right-5 flex flex-col gap-2.5 max-w-[90vw]" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="qx-toast flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl"
          style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-pop)", minWidth: 260 }}>
          <span style={{ color: COLOR[t.kind] }}>{ICON[t.kind]}</span>
          <span className="text-[13.5px] font-semibold flex-1" style={{ color: "var(--text)" }}>{t.text}</span>
          <button onClick={() => setToasts((c) => c.filter((x) => x.id !== t.id))} className="qx-btn-ghost !p-1.5" aria-label="Dismiss"><FiX size={14} /></button>
        </div>
      ))}
      <style>{`
        .qx-toast { animation: qxToastIn .35s cubic-bezier(.22,.9,.3,1.2) both; }
        @keyframes qxToastIn { from { opacity: 0; transform: translateX(30px) scale(.96); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .qx-toast { animation: none; } }
      `}</style>
    </div>
  );
}

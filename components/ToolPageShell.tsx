"use client";

import Link from "next/link";
import { FiChevronRight, FiInfo, FiCheckCircle } from "react-icons/fi";
import GlobalFileDrop from "@/components/GlobalFileDrop";

type Step = { title: string; desc: string };

export default function ToolPageShell({
  category,
  categoryHref,
  title,
  emoji,
  grad,
  intro,
  about,
  steps,
  children,
}: {
  category: string;
  categoryHref: string;
  title: string;
  emoji: string;
  grad: string;
  intro: string;
  about: string;
  steps: Step[];
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto p-5 lg:p-8">
      <GlobalFileDrop />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "var(--text-muted)" }}>
        <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
        <FiChevronRight size={12} />
        <Link href={categoryHref} className="hover:opacity-80">{category}</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{title}</span>
      </div>

      {/* Hero */}
      <div className="qx-card qx-rise p-7 mb-7 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,.2), transparent 70%)" }} />
        <div className="relative flex items-start gap-4">
          <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: grad, boxShadow: "0 12px 32px rgba(124,58,237,.35)" }}>
            {emoji}
          </span>
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "var(--text-muted)" }}>{intro}</p>
          </div>
        </div>
      </div>

      {/* Tool */}
      <div className="qx-rise qx-rise-1">{children}</div>

      {/* About + How-to */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="qx-card p-6">
          <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}>
            <FiInfo size={16} style={{ color: "var(--primary-bright)" }} /> About this tool
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{about}</p>
        </div>

        <div className="qx-card p-6">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>How to use</h2>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "var(--grad-primary)" }}>
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--text)" }}>{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

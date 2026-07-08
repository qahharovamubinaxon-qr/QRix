import Link from "next/link";
import type { Metadata } from "next";
import Illustration from "@/components/Illustrations";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5 relative">
      <div className="qx-aurora-bg" aria-hidden />
      <div className="relative">
        <Illustration name="search" size={140} className="mx-auto mb-5" />
        <p className="text-[12px] font-bold uppercase tracking-[.2em] mb-2" style={{ color: "var(--text-faint)" }}>Error 404</p>
        <h1 className="font-display text-4xl font-extrabold mb-3" style={{ color: "var(--text)" }}>
          This page wandered off
        </h1>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          The link is broken or the page has moved — but 185+ free tools are one click away.
          Press <kbd className="px-1.5 py-0.5 rounded text-[11px] font-bold" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>Ctrl K</kbd> to search anything.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="qx-btn-hero !text-sm">Take me home</Link>
          <Link href="/qr-tools" className="qx-btn-hero-ghost !text-sm">QR Tools</Link>
          <Link href="/pdf-tools" className="qx-btn-hero-ghost !text-sm">PDF Tools</Link>
          <Link href="/ai-tools" className="qx-btn-hero-ghost !text-sm">AI Tools</Link>
        </div>
      </div>
    </main>
  );
}

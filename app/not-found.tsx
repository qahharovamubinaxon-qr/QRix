import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <div className="text-7xl mb-3">🔍</div>
      <h1 className="font-display text-4xl font-extrabold mb-2" style={{ color: "var(--text)" }}>404 — Page not found</h1>
      <p className="text-sm mb-7 max-w-md" style={{ color: "var(--text-muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved. But we have 55+ free tools waiting for you.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="qx-btn-hero !text-sm">Go home</Link>
        <Link href="/qr-tools" className="qx-btn-hero-ghost !text-sm">QR Tools</Link>
        <Link href="/pdf-tools" className="qx-btn-hero-ghost !text-sm">PDF Tools</Link>
      </div>
    </main>
  );
}

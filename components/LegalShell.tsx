import Link from "next/link";

export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-5 lg:px-8 py-12">
      <Link href="/" className="text-[13px]" style={{ color: "var(--text-muted)" }}>← Back to home</Link>
      <h1 className="font-display text-3xl font-extrabold mt-4 mb-1" style={{ color: "var(--text)" }}>{title}</h1>
      <p className="text-[12px] mb-8" style={{ color: "var(--text-faint)" }}>Last updated: {updated}</p>
      <div className="space-y-1.5">{children}</div>
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg font-bold mt-7 mb-1.5" style={{ color: "var(--text)" }}>{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{children}</p>;
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 text-[14px] leading-relaxed space-y-1" style={{ color: "var(--text-muted)" }}>{children}</ul>;
}

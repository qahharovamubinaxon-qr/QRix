import type { Metadata } from "next";
import Link from "next/link";
import { decodeBio } from "@/lib/linkpage";
import BioView from "@/components/BioView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ d?: string }> }): Promise<Metadata> {
  const { d } = await searchParams;
  const page = d ? decodeBio(d) : null;
  return {
    title: page?.t ? `${page.t} — Links` : "Bio Page",
    description: page?.s || "All my links in one place.",
    robots: { index: false, follow: false }, // user pages shouldn't be indexed
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const page = d ? decodeBio(d) : null;

  if (!page) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="font-display text-2xl font-extrabold mb-2" style={{ color: "var(--text)" }}>Page not found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>This bio link looks broken or incomplete.</p>
        <Link href="/link-in-bio" className="qx-btn-hero !text-sm">Create your own bio page</Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh]">
      <BioView page={page} />
    </main>
  );
}

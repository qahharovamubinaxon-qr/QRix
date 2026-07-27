"use client";

import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { HOME_POSTS } from "@/lib/home-posts";

/** Three latest blog cards + link to the blog — internal-linking + freshness signal.
 *  Reads the inlined card list, NOT lib/blog: this renders inside a "use client"
 *  page, so importing the 88 KB post catalog here put it on every homepage view.
 *  See lib/home-posts.ts for why the data is inlined rather than deferred. */
export default function LatestPosts({ heading, cta }: { heading: string; cta: string }) {
  const posts = HOME_POSTS;
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-24 lg:pb-32" aria-label={heading}>
      <div className="flex items-end justify-between gap-4 mb-8" data-reveal>
        <h2 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{heading}</h2>
        <Link href="/blog" className="qx-btn-ghost !text-xs shrink-0">{cta} <FiArrowRight size={13} /></Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p, i) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group qx-glass qx-card-lift p-6 flex flex-col"
            data-reveal="scale" style={{ ["--rv-delay" as string]: `${i * 90}ms` } as React.CSSProperties}>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start mb-3" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}>
              {p.category}
            </span>
            <h3 className="font-display text-lg font-bold leading-snug flex-1" style={{ color: "var(--text)" }}>{p.title}</h3>
            <div className="flex items-center justify-between mt-4 text-[12px]" style={{ color: "var(--text-faint)" }}>
              <span className="inline-flex items-center gap-1"><FiClock size={12} /> {p.readMins} min</span>
              <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                Read <FiArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

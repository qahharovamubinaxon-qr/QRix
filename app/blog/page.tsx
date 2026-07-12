import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { pageMeta, jsonLd, SITE_URL } from "@/lib/seo";
import { allPostsSorted } from "@/lib/blog";

export const metadata = pageMeta({
  title: "QRix Blog — Guides for QR, PDF, Image, Video & AI Tools",
  description:
    "Practical, up-to-date guides for every QRix tool: animated QR codes, compressing video, removing PDF pages, AI upscaling, EXIF privacy and more — each with the free tool to do it right there.",
  path: "/blog",
  keywords: ["qr code guide", "pdf tips", "how to make a qr code", "compress video online", "ai image upscaler", "image tools guide", "video to gif"],
});

// Topical-cluster order: newest, most valuable content areas first.
const CATEGORY_ORDER = ["QR Codes", "AI", "Video", "Image", "PDF", "Guides"] as const;

export default function BlogIndex() {
  const posts = allPostsSorted();

  // Group posts into topical clusters (strong signal for search engines).
  const groups = CATEGORY_ORDER
    .map((cat) => ({ cat, items: posts.filter((p) => p.category === cat) }))
    .filter((g) => g.items.length > 0);
  const known = new Set<string>(CATEGORY_ORDER as readonly string[]);
  const otherItems = posts.filter((p) => !known.has(p.category));
  if (otherItems.length) groups.push({ cat: "More" as (typeof CATEGORY_ORDER)[number], items: otherItems });

  return (
    <main className="max-w-5xl mx-auto px-5 py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "QRix Blog",
          url: `${SITE_URL}/blog`,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.date,
            description: p.description,
          })),
        })}
      />

      <div className="text-center mb-10">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // GUIDES &amp; HOW-TOS
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>The QRix Blog</h1>
        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Clear, practical guides for QR codes, PDFs, images, video and AI — each paired with the free tool to do it right there.
        </p>
      </div>

      {/* Cluster nav — anchors help both readers and crawlers map the topics. */}
      <nav className="flex flex-wrap justify-center gap-2 mb-12" aria-label="Blog categories">
        {groups.map((g) => (
          <a key={g.cat} href={`#${g.cat.toLowerCase().replace(/\s+/g, "-")}`}
            className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            {g.cat} <span style={{ color: "var(--text-faint)" }}>{g.items.length}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        {groups.map((g) => (
          <section key={g.cat} id={g.cat.toLowerCase().replace(/\s+/g, "-")} aria-label={`${g.cat} guides`}>
            <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-3" style={{ color: "var(--text)" }}>
              {g.cat}
              <span className="h-px flex-1" style={{ background: "var(--border)" }} />
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {g.items.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group qx-card qx-card-lift p-6 flex flex-col">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start mb-3 text-white" style={{ background: "var(--grad-primary)" }}>
                    {p.category}
                  </span>
                  <h3 className="font-display text-lg font-bold leading-snug" style={{ color: "var(--text)" }}>{p.title}</h3>
                  <p className="text-sm mt-2 flex-1" style={{ color: "var(--text-muted)" }}>{p.description}</p>
                  <div className="flex items-center justify-between mt-4 text-[12px]" style={{ color: "var(--text-faint)" }}>
                    <span className="inline-flex items-center gap-1"><FiClock size={12} /> {p.readMins} min read</span>
                    <span className="inline-flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                      Read <FiArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

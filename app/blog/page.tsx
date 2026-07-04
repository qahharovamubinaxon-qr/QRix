import Link from "next/link";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { pageMeta, jsonLd, SITE_URL } from "@/lib/seo";
import { allPostsSorted } from "@/lib/blog";

export const metadata = pageMeta({
  title: "QRix Blog — QR Code, PDF & Image Tool Guides",
  description:
    "Practical guides on QR codes, PDF editing and image tools: how to create a QR code, merge or compress PDFs, remove image backgrounds and more.",
  path: "/blog",
  keywords: ["qr code guide", "pdf tips", "how to make a qr code", "pdf tools blog", "image tools guide"],
});

export default function BlogIndex() {
  const posts = allPostsSorted();
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

      <div className="text-center mb-12">
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>The QRix Blog</h1>
        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Clear, practical guides for QR codes, PDFs and images — with the free tool to do it right there.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group qx-card qx-card-lift p-6 flex flex-col">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start mb-3 text-white" style={{ background: "var(--grad-primary)" }}>
              {p.category}
            </span>
            <h2 className="font-display text-lg font-bold leading-snug" style={{ color: "var(--text)" }}>{p.title}</h2>
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
    </main>
  );
}

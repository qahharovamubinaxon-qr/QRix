import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight, FiClock, FiChevronRight } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { getPost, getPost as _get, POSTS } from "@/lib/blog";
import { getAutopilotPost } from "@/lib/server/autopilot";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";

// Statically render hand-written posts; autopilot posts render on demand (ISR).
export const revalidate = 3600;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug) || (await getAutopilotPost(slug));
  if (!post) return pageMeta({ title: "Article not found", path: `/blog/${slug}`, noindex: true });
  const meta = pageMeta({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
  });
  // Articles deserve og:type=article + published time (richer social/rich results).
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [SITE_NAME],
      section: post.category,
      tags: post.keywords,
    },
  };
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug) || (await getAutopilotPost(slug));
  if (!post) notFound();

  const related = post.related.map((s) => _get(s)).filter(Boolean);
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` } },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          faqLd(post.faqs),
        ])}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:opacity-80">Home</Link>
        <FiChevronRight size={12} />
        <Link href="/blog" className="hover:opacity-80">Blog</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{post.category}</span>
      </nav>

      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>{post.category}</span>
      <h1 className="font-display text-3xl lg:text-4xl font-extrabold mt-4" style={{ color: "var(--text)" }}>{post.title}</h1>
      <div className="flex items-center gap-3 mt-3 text-[12px] flex-wrap" style={{ color: "var(--text-faint)" }}>
        <span className="inline-flex items-center gap-1"><FiClock size={12} /> {post.readMins} min read</span>
        <span>·</span>
        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
        <span className="flex-1" />
        <BookmarkButton item={{ href: `/blog/${post.slug}`, title: post.title, group: "Blog" }} />
      </div>

      <p className="text-lg leading-relaxed mt-6" style={{ color: "var(--text-muted)" }}>{post.intro}</p>

      {/* Primary CTA */}
      <Link href={post.toolHref} className="qx-btn-hero inline-flex mt-6">{post.toolLabel} <FiArrowRight size={15} /></Link>

      {/* Body */}
      <article className="mt-10 space-y-9">
        {post.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>{s.h}</h2>
            {s.p.map((para, j) => (
              <p key={j} className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{para}</p>
            ))}
          </section>
        ))}
      </article>

      {/* Share */}
      <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <ShareButtons url={url} title={post.title} />
      </div>

      {/* In-content ad — renders only after AdSense approval (env-gated) */}
      <AdSlot slot="blog-in-article" format="fluid" className="mt-12" />

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
        <div className="space-y-4">
          {post.faqs.map((f, i) => (
            <div key={i} className="qx-card p-5">
              <h3 className="font-bold text-[15px] mb-1.5" style={{ color: "var(--text)" }}>{f.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <div className="qx-card p-7 mt-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.15), transparent 70%)" }} />
        <h2 className="font-display text-xl font-bold relative" style={{ color: "var(--text)" }}>Ready to try it?</h2>
        <p className="text-sm mt-2 relative" style={{ color: "var(--text-muted)" }}>It's free, private and works in your browser — no signup needed.</p>
        <Link href={post.toolHref} className="qx-btn-hero inline-flex mt-5 relative">{post.toolLabel} <FiArrowRight size={15} /></Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>Keep reading</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => r && (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group qx-card qx-card-lift p-5">
                <h3 className="font-bold text-[15px] leading-snug" style={{ color: "var(--text)" }}>{r.title}</h3>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-3 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                  Read <FiArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

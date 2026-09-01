import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight, FiClock, FiChevronRight, FiUser } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, SITE_URL, SITE_NAME, ogImageUrl } from "@/lib/seo";
import { articleAuthorLd, articlePublisherLd, BYLINE, OPERATOR } from "@/lib/operator";
import { getPost, POSTS, formatPostDate } from "@/lib/blog";
import { getAutopilotPost } from "@/lib/server/autopilot";
import { relatedPosts } from "@/lib/server/blog-related";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButtons from "@/components/ShareButtons";
import AdsterraSlot from "@/components/AdsterraSlot";

// Statically render hand-written posts; autopilot posts render on demand (ISR).
export const revalidate = 3600;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

/* M118 set dynamicParams=false here to kill soft-404s, but this route is NOT
   registry-only: autopilot posts live in Supabase and publish daily WITHOUT a
   deploy, so they were never in generateStaticParams and every one of them
   404'd in production (6 of the 10 newest posts at the time of the M142 audit)
   while the blog index and Blog schema kept advertising them. dynamicParams
   must stay true; unknown slugs still hard-404 via the notFound() below. */
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug) || (await getAutopilotPost(slug));
  /* notFound() HERE, not only in the page body: metadata resolves before the
     root loading boundary starts streaming, so this yields a real HTTP 404.
     Thrown from the body it lands after the 200 shell has been sent and the
     status can't change — the soft-404 M118 documented on this route. */
  if (!post) notFound();
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

  /* Resolved from BOTH sources and topped up to six. Reading it out of the
     static registry alone silently dropped every autopilot post (they name each
     other, and they live in Supabase), so this section did not render at all on
     the newest ~40 articles. See lib/server/blog-related.ts. */
  const related = await relatedPosts(post);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const published = formatPostDate(post.date, { year: "numeric", month: "long", day: "numeric" });

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
            /* Omitted rather than emitted raw: an unparseable stored date would
               otherwise ship into schema as an invalid value. */
            ...(published ? { datePublished: published.iso, dateModified: published.iso } : {}),
            mainEntityOfPage: url,
            /* M145: `image` was missing entirely (audit schema F3) — Google lists
               it as required for Article. There is no per-post artwork, so this
               is the post's own generated card (its title, not the generic one) —
               a real served 1200x630 PNG, same one used in og:image below.
               author is now a Person @id-linked to /about#operator rather than an
               anonymous Organization copy: a named human is the stronger E-E-A-T
               signal, and the @id makes every article the SAME human. */
            image: { "@type": "ImageObject", url: ogImageUrl(post.title), width: 1200, height: 630 },
            author: articleAuthorLd(),
            publisher: articlePublisherLd(),
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
      {/* M145: a visible byline. The date and read time were already here, but no
          article said WHO wrote it — the audit's "Who created it?" failure. The
          name is a link to /about so the claim is checkable, and it is the same
          string the Article author schema carries. */}
      <div className="flex items-center gap-3 mt-3 text-[12px] flex-wrap" style={{ color: "var(--text-faint)" }}>
        <span className="inline-flex items-center gap-1">
          <FiUser size={12} />
          <span>By{" "}
            <Link href="/about" rel="author" className="font-semibold hover:opacity-80" style={{ color: "var(--text-muted)" }}>
              {OPERATOR.fullName || OPERATOR.name}
            </Link>
          </span>
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1"><FiClock size={12} /> {post.readMins} min read</span>
        {published && (
          <>
            <span>·</span>
            <time dateTime={published.iso}>{published.label}</time>
          </>
        )}
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

      {/* About the author (M145). The byline at the top says who; this says why
          they'd know. Same Person entity as the schema author. */}
      <aside className="qx-card p-5 mt-8 flex items-start gap-4">
        <span
          aria-hidden="true"
          className="font-display font-extrabold text-lg shrink-0 grid place-items-center rounded-full text-white"
          style={{ width: 44, height: 44, background: "var(--grad-primary)" }}
        >
          {(OPERATOR.fullName || OPERATOR.name).charAt(0)}
        </span>
        <div>
          <p className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{BYLINE}</p>
          <p className="text-[13px] leading-relaxed mt-1" style={{ color: "var(--text-muted)" }}>
            {OPERATOR.role} — the {SITE_NAME} tools are built and maintained by one
            developer, and these guides are written from doing the work.{" "}
            <Link href="/about" rel="author" className="font-semibold" style={{ color: "var(--primary)" }}>
              More about who builds this
            </Link>
            .
          </p>
        </div>
      </aside>

      {/* In-content ad, env-gated — nothing renders until the key is set. */}
      <AdsterraSlot format="banner" width={300} height={250} />

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
        <p className="text-sm mt-2 relative" style={{ color: "var(--text-muted)" }}>It&rsquo;s free, private and works in your browser — no signup needed.</p>
        <Link href={post.toolHref} className="qx-btn-hero inline-flex mt-5 relative">{post.toolLabel} <FiArrowRight size={15} /></Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>Keep reading</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => (
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

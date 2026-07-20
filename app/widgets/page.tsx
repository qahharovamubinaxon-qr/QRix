import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/seo";
import EmbedSnippet from "@/components/EmbedSnippet";

const TITLE = "Free Embeddable Downloader Widget — Add QRix to Your Site";
const DESC = "Add a free video downloader to your website or blog with one line of HTML. No signup, no fees — paste the iframe and your visitors can save videos without leaving your page.";

const FAQS = [
  { q: "How do I add the widget to my site?", a: "Copy the iframe code below and paste it into your page's HTML wherever you want the downloader to appear. It works on WordPress, Blogger, Webflow, plain HTML — anywhere you can add an embed." },
  { q: "Is it free?", a: "Yes, completely free. There is no signup and no limit on how many sites embed it." },
  { q: "Does it slow down my page?", a: "No — the widget loads in an isolated iframe, so it never blocks your own page from rendering." },
  { q: "Can I change the size?", a: "Yes. Adjust the width and height attributes on the iframe to fit your layout. It's responsive down to about 300px wide." },
];

export const metadata = pageMeta({
  title: TITLE,
  description: DESC,
  path: "/widgets",
  keywords: ["embeddable downloader", "video downloader widget", "iframe downloader", "add downloader to website", "free downloader embed", "wordpress video downloader widget"],
});

export default function WidgetsPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Widgets", path: "/widgets" }]),
          faqLd(FAQS),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">›</span> Widgets
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            Embed a free downloader on your site
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{DESC}</p>
        </header>

        <EmbedSnippet base={SITE_URL} />

        {/* how it works */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>How it works</h2>
          <ol className="space-y-3">
            {[
              ["Copy the code", "Grab the iframe snippet above with one click."],
              ["Paste it into your page", "Drop it into any HTML block — WordPress, Blogger, Webflow, Tilda, or a plain .html file."],
              ["Done", "Your visitors can now download videos right on your site. Every widget links back to QRix — that's the deal: you get a free tool, we get a mention."],
            ].map(([h, p], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{p}</span></div>
              </li>
            ))}
          </ol>
        </section>

        {/* faq */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

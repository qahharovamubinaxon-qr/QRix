import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";

/* Honest comparison pages — "QRix vs X" queries convert at the highest rate
   of any SEO content. Each page: feature table, honest verdict (including
   where the competitor is stronger — credibility IS the conversion), FAQ. */

type Row = [string, string, string]; // feature, QRix, competitor
type Cmp = {
  name: string; title: string; desc: string; intro: string;
  keywords: string[]; competitorNote: string; rows: Row[];
  verdict: string; cta: { href: string; label: string };
  faqs: { q: string; a: string }[];
};

const COMPARES: Record<string, Cmp> = {
  "qrix-vs-ilovepdf": {
    name: "iLovePDF",
    title: "QRix vs iLovePDF (2026): Free PDF Tools Compared",
    desc: "An honest comparison of QRix and iLovePDF: PDF to Word quality, file limits, watermarks, pricing and privacy — which free PDF toolbox fits you.",
    intro: "iLovePDF is the best-known PDF suite on the web, and it earned that. QRix takes a different angle: the same everyday PDF jobs plus 160+ non-PDF tools, with no signup and no daily-task limits. Here is the honest breakdown.",
    keywords: ["qrix vs ilovepdf", "ilovepdf alternative", "ilovepdf free alternative", "best free pdf tools", "pdf to word free no limit"],
    competitorNote: "iLovePDF free tier limits tasks per day and file sizes; Premium removes limits from $4–7/month.",
    rows: [
      ["PDF → Word fidelity", "Cloud engine, layout kept 1:1 (tables, fonts, stamps)", "Excellent — the industry benchmark"],
      ["Free daily limits", "No task limits", "Limited tasks/day on free tier"],
      ["Signup required", "Never", "For some features and history"],
      ["Watermarks", "None", "None on most tools"],
      ["Beyond PDF", "185+ tools: QR studio, AI images, 3D, video, downloader", "PDF-focused (+ some image tools)"],
      ["On-device privacy mode", "Most tools can process files in your browser", "Server-side processing"],
      ["Price for no limits", "Free", "Premium from ~$4/month"],
    ],
    verdict: "If you live inside PDFs all day and want a mobile app, iLovePDF Premium is a polished choice. If you want the same everyday conversions free without limits — plus QR, AI-image, video and downloader tools in the same tab — QRix is the more practical toolbox.",
    cta: { href: "/pdf-tools/pdf-to-word", label: "Try PDF → Word free" },
    faqs: [
      { q: "Is QRix's PDF to Word really comparable?", a: "Yes — QRix uses a professional cloud conversion engine that preserves tables, fonts and layout 1:1, verified side-by-side against iLovePDF output on real documents." },
      { q: "Does QRix limit tasks per day?", a: "No. Fair-use rate limits prevent abuse, but there is no daily task counter and no file-size bait." },
      { q: "Which is better for teams?", a: "iLovePDF has mature team plans. QRix offers free workspaces — for a small team on a budget QRix wins; for enterprise procurement iLovePDF is more established." },
    ],
  },
  "qrix-vs-tinywow": {
    name: "TinyWow",
    title: "QRix vs TinyWow (2026): Which Free Toolbox Is Better?",
    desc: "TinyWow and QRix both promise free everything. Honest comparison: ads, AI tools, QR studio, downloader, speed and privacy.",
    intro: "TinyWow proved the 'everything free' model works. QRix follows the same philosophy with a different mix: a real QR design studio, an AI/3D lab, a social downloader — and zero ads on the tools.",
    keywords: ["qrix vs tinywow", "tinywow alternative", "sites like tinywow", "free online tools no signup", "tinywow without ads"],
    competitorNote: "TinyWow is ad-supported: free tools with ads, or ad-free from ~$6/month.",
    rows: [
      ["Ads on tool pages", "None", "Yes on free tier (ad-free is paid)"],
      ["QR codes", "Full design studio: logos, AI art, bulk CSV, scan analytics", "Basic generator"],
      ["Social downloader", "TikTok no-watermark, IG, VK, OK + 13 more", "Limited"],
      ["AI tools", "Avatars, denoiser, upscaler, image-to-3D + cloud AI chain", "AI writing + some image tools"],
      ["PDF suite", "21 tools incl. 1:1 PDF→Word", "Large PDF set"],
      ["Runs on-device", "Most tools — files stay on your machine", "Server-side"],
      ["Price for ad-free", "Free", "~$6/month"],
    ],
    verdict: "TinyWow has a bigger brand and a huge tool count. QRix gives you the same breadth without ads, adds a genuinely deeper QR studio and downloader, and processes most files on your device. For daily use the ad-free experience is the difference you feel.",
    cta: { href: "/", label: "Open the QRix toolbox" },
    faqs: [
      { q: "Is QRix really ad-free?", a: "Tool pages are kept clean — no pop-ups and no interstitial ads between you and your file." },
      { q: "Which has more tools?", a: "Counts are similar (185+ on QRix). What matters is depth: compare the QR studio or the downloader head-to-head and judge in two minutes." },
      { q: "Is my file uploaded?", a: "On QRix most image/PDF/video tools run inside your browser — the file never leaves your device. Cloud-powered tools say so explicitly." },
    ],
  },
  "qrix-vs-snaptik": {
    name: "SnapTik",
    title: "QRix vs SnapTik (2026): TikTok Downloader Without the Ads",
    desc: "SnapTik vs QRix for downloading TikTok without a watermark: pop-ups, redirects, MP3 support, other platforms and safety compared honestly.",
    intro: "SnapTik does one job — TikTok videos without the watermark — and does it fast. The price is the ad gauntlet: pop-unders, redirect chains and fake Download buttons. QRix does the same job with zero ads, plus 16 more platforms in the same box.",
    keywords: ["qrix vs snaptik", "snaptik alternative", "snaptik without ads", "tiktok downloader no watermark safe", "ssstik alternative"],
    competitorNote: "SnapTik/SSSTik-class sites are free but monetize through aggressive ad networks — pop-unders and redirect ads on every click.",
    rows: [
      ["TikTok no-watermark HD", "Yes", "Yes"],
      ["Pop-ups / redirect ads", "None", "Heavy — the main complaint"],
      ["Sound as MP3", "Yes", "Yes"],
      ["Other platforms", "Instagram, VK, OK, X, Pinterest, SoundCloud + 10 more", "TikTok only (sister sites for others)"],
      ["Photo/carousel posts", "Yes", "Partial"],
      ["Fake Download buttons", "Never", "Common (they're ads)"],
      ["Progress / preview UI", "Thumbnail, formats, live progress bar", "Basic"],
    ],
    verdict: "For a single quick TikTok grab both work. For daily use, QRix removes the part everyone hates — the ads and fake buttons — and replaces five single-platform sites with one clean downloader.",
    cta: { href: "/downloader/tiktok", label: "Download a TikTok (no watermark)" },
    faqs: [
      { q: "Is QRix's downloader really free with no catch?", a: "Yes — no ads, no signup, no watermark added. A fair-use limit of 40 downloads/hour keeps it fast for everyone." },
      { q: "Why do downloader sites have so many ads?", a: "It's their only revenue. QRix is part of a larger toolbox with its own model, so the downloader stays clean." },
      { q: "Is it safe?", a: "QRix serves files over HTTPS from the platform's own CDN through a signed proxy — no bundled installers, no notification-permission tricks." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(COMPARES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARES[slug];
  if (!c) return {};
  return pageMeta({ title: c.title, description: c.desc, path: `/compare/${slug}`, keywords: c.keywords });
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARES[slug];
  if (!c) notFound();
  const others = Object.entries(COMPARES).filter(([s]) => s !== slug);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: `QRix vs ${c.name}`, path: `/compare/${slug}` }]),
          faqLd(c.faqs),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">›</span> QRix vs {c.name}
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{c.title.replace(/ \(2026\).*/, "")}</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
          <p className="mt-2 text-[12.5px]" style={{ color: "var(--text-faint)" }}>{c.competitorNote}</p>
        </header>

        {/* comparison table */}
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[13px]" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th className="text-left px-4 py-3 font-bold">Feature</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--primary-bright)" }}>QRix</th>
                <th className="text-left px-4 py-3 font-bold">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map(([f, a, b]) => (
                <tr key={f} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-muted)" }}>{f}</td>
                  <td className="px-4 py-3">{a}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* verdict */}
        <section className="mt-8 qx-card p-5">
          <h2 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text)" }}>The honest verdict</h2>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.verdict}</p>
          <Link href={c.cta.href} className="qx-btn-hero inline-flex mt-4 !px-6">{c.cta.label}</Link>
        </section>

        {/* faq */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* other comparisons */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>More comparisons</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map(([s, o]) => (
              <Link key={s} href={`/compare/${s}`} className="inline-flex px-3 py-1.5 rounded-full text-[12.5px] font-semibold hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                QRix vs {o.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

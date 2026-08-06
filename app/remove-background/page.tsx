import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { BG_USE_CASES } from "@/lib/removebg-usecases";

/* The hub. It exists to be the crawlable parent of the family — the lesson of
   M147e, where 167 pages sat in the sitemap and nowhere else and Google never
   fetched one of them. Linked from /image-tools and /image-tools/remove-bg,
   both of which are indexed. */

export const metadata = pageMeta({
  title: "Remove Background from Any Image — Free, In Your Browser",
  description:
    "Cut the background out of a signature, logo, product photo, portrait or car. Runs on your device with no upload, and downloads as a transparent PNG.",
  path: "/remove-background",
  keywords: ["remove background", "background remover", "transparent png", "free background remover"],
});

const HUB_FAQS = [
  {
    q: "Is anything uploaded to a server?",
    a: "No. The model runs in your browser, so the image stays on your device — which is why this works on a signature or an identity document without a policy question.",
  },
  {
    q: "What do I get back?",
    a: "A PNG, with the background either transparent or replaced by one of ten solid colours. PNG is the format that stores transparency; a JPG cannot.",
  },
  {
    q: "What does it struggle with?",
    a: "Anything the eye also finds ambiguous: fine hair against a busy background, glass, mesh, wire, and thin transparent packaging. Photographing against a contrasting background helps more than any setting.",
  },
  {
    q: "Is it free, and is there a watermark?",
    a: "Free, with no account, and no watermark — the file is produced by your own browser.",
  },
];

export default function RemoveBackgroundHub() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Remove Background", path: "/remove-background" },
          ]),
          faqLd(HUB_FAQS),
        ])} />

      <main className="max-w-[1100px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          // BACKGROUND REMOVAL — {BG_USE_CASES.length} GUIDES · ON-DEVICE
        </p>
        <h1 className="font-display font-extrabold tracking-tight leading-[1.05] mb-4"
          style={{ color: "var(--text)", fontSize: "clamp(30px, 3.8vw, 48px)" }}>
          Remove a background from any image
        </h1>
        <p className="text-[15px] max-w-2xl leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
          The same tool on every page below, with the part that actually differs written out:
          what tends to go wrong when you cut out a signature is not what goes wrong with hair,
          a glass bottle or a chair leg. Everything runs in your browser and downloads as a PNG.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          {BG_USE_CASES.map((u) => (
            <Link key={u.slug} href={`/remove-background/${u.slug}`}
              className="rounded-2xl p-4 transition-opacity hover:opacity-90"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-[22px] mb-2" aria-hidden>{u.emoji}</div>
              <div className="font-bold text-[14.5px] mb-1" style={{ color: "var(--text)" }}>{u.h1}</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{u.intro}</div>
            </Link>
          ))}
        </div>

        <section aria-labelledby="hub-faq" className="mb-12">
          <h2 id="hub-faq" className="font-display font-bold text-[22px] mb-5" style={{ color: "var(--text)" }}>
            Questions worth answering first
          </h2>
          <div className="space-y-4">
            {HUB_FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="font-bold text-[14px] mb-1.5" style={{ color: "var(--text)" }}>{f.q}</p>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/image-tools/remove-bg" className="qx-btn">Open the tool</Link>
          <Link href="/image-tools" className="qx-btn-ghost">All image tools</Link>
        </div>
      </main>
    </>
  );
}

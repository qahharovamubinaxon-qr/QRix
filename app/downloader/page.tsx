import DownloaderClient from "@/components/DownloaderClient";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";
import Link from "next/link";

const TITLE = "Video Downloader — TikTok, Instagram, VK & More";
const DESC = "Free online video, audio & image downloader. Paste a link from TikTok, Instagram, VK, X, Facebook, Pinterest, Reddit and more — save MP4, MP3 or JPG in your chosen quality. No ads, no signup, no watermark.";

const FAQS = [
  { q: "How do I download a video?", a: "Copy the video's link, paste it into the box above, and pick a format — video (MP4), audio (MP3) or image. The download starts instantly through QRix, with no ads or pop-ups." },
  { q: "Is it free?", a: "Yes — completely free, no signup, no watermark, and no software to install. Everything runs in your browser." },
  { q: "Which sites are supported?", a: `QRix downloads from ${PLATFORMS.map((p) => p.name).join(", ")}. More platforms are added regularly.` },
  { q: "Can I download just the audio (MP3)?", a: "Yes. When a link has an audio track, an “Audio · MP3” option appears — perfect for saving sounds and music from TikTok or Instagram." },
  { q: "Does QRix store my downloads?", a: "No. QRix only passes the file through to your device and hosts none of the media. Please only download content you have the right to use." },
  { q: "Why isn't YouTube supported?", a: "QRix focuses on social platforms and does not offer YouTube downloading, in line with advertising and platform policies." },
];

export const metadata = pageMeta({
  title: TITLE,
  description: DESC,
  path: "/downloader",
  keywords: ["video downloader", "tiktok downloader", "instagram downloader", "vk video download", "mp3 downloader", "save video without watermark", "download reels", "twitter video downloader"],
});

export default function DownloaderPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(TITLE, DESC, "/downloader"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Downloader", path: "/downloader" }]),
          faqLd(FAQS),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">›</span> Downloader
        </nav>

        <header className="mb-6">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            Video, Audio &amp; Image Downloader
          </h1>
          <p className="mt-2 text-[14.5px]" style={{ color: "var(--text-muted)" }}>{DESC}</p>
        </header>

        <DownloaderClient />

        {/* how it works */}
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>How it works</h2>
          <ol className="space-y-3">
            {[
              ["Copy the link", "Open the post on TikTok, Instagram, VK, X and copy its share link."],
              ["Paste it above", "Drop the link in the box — QRix instantly finds the video, audio and image versions."],
              ["Pick a format & save", "Choose video (MP4), audio (MP3) or image and the quality — it downloads straight to your device."],
            ].map(([h, p], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{p}</span></div>
              </li>
            ))}
          </ol>
        </section>

        {/* supported — each links to its dedicated guide page */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Supported platforms</h2>
          <div className="flex flex-wrap gap-2.5">
            {PLATFORMS.map((p) => (
              <Link key={p.id} href={`/downloader/${p.id}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span className="w-5 h-5 block" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} /> {p.name}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            Tap a platform for its dedicated downloader guide — TikTok without watermark, Reddit with sound, SoundCloud to MP3 and more.
          </p>
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

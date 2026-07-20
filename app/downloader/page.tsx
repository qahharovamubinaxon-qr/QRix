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
  languages: { en: "/downloader", ru: "/ru/downloader", "x-default": "/downloader" },
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

        {/* what you can download */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>What you can download</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ["🎬", "Video · MP4", "The full video in the best quality the platform offers — HD where available, TikTok without the watermark. Plays everywhere: phone, computer, TV."],
              ["🎵", "Audio · MP3", "Just the soundtrack as an MP3 — trending TikTok sounds, Reels music, SoundCloud tracks. If a platform can't give audio directly (like OK.ru), QRix extracts it from the video right in your browser."],
              ["🖼️", "Image · JPG", "Photos and image posts in original resolution — Instagram photos, Pinterest pins, post images from X and Reddit."],
            ].map(([ic, h, body]) => (
              <div key={h} className="qx-card p-4">
                <div className="text-xl mb-2" aria-hidden>{ic}</div>
                <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{h}</h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* about the tool */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>About this tool</h2>
          <div className="qx-card p-5 space-y-3 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <p>
              QRix Downloader saves public videos, sounds and images from {PLATFORMS.length} social platforms with one paste.
              There are no ads, no pop-ups, no fake Download buttons and nothing to install — the download starts
              in your browser with a live progress bar, on any phone or computer.
            </p>
            <p>
              <b style={{ color: "var(--text)" }}>Privacy:</b> QRix hosts no media and keeps no copies — the file
              streams straight through to your device and the link is processed securely on our servers.
              Private, friends-only and password-protected posts can never be accessed.
            </p>
            <p>
              <b style={{ color: "var(--text)" }}>Tips:</b> use the platform&apos;s own Share → Copy link button for the most
              reliable link; short links (vt.tiktok.com, pin.it, t.co, reddit share links) are resolved automatically;
              if a link fails, check that the post is public and try again — some videos are region-locked by the platform.
            </p>
          </div>
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

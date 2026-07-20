import DownloaderClient from "@/components/DownloaderClient";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/seo";

/* Bare downloader widget for embedding on other sites. noindex (the real page
   at /downloader carries the SEO); this exists to be iframed, and every embed
   is a backlink + a "Powered by QRix" click-through. */
export const metadata = pageMeta({
  title: "QRix Downloader (embed)",
  description: "Embeddable video/audio downloader widget by QRix.",
  path: "/embed/downloader",
  noindex: true,
});

export default function EmbedDownloader() {
  return (
    <div>
      <DownloaderClient compact placeholder="Paste a TikTok, Instagram, VK… link" />
      <div className="mt-3 text-center">
        <a href={`${SITE_URL}/downloader?utm_source=embed&utm_medium=widget`} target="_blank" rel="noopener"
          className="text-[11px] font-semibold" style={{ color: "var(--text-faint)" }}>
          ⚡ Powered by <span style={{ color: "var(--primary-bright)" }}>QRix</span> — 185+ free tools
        </a>
      </div>
    </div>
  );
}

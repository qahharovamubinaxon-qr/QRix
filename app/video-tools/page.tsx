import type { Metadata } from "next";
import VideoToolsLanding from "@/components/video/VideoToolsLanding";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { VIDEO_TOOLS } from "@/lib/video-tools-meta";

export const metadata: Metadata = pageMeta({
  title: "Free Video Tools — Compress, Trim, Convert, GIF & 25+ More",
  description:
    "A complete video studio in your browser: compress, trim, merge, crop, convert, make GIFs, extract audio and edit subtitles — free, private, no upload.",
  path: "/video-tools",
  keywords: ["video tools", "free video editor online", "compress video", "trim video", "video converter"],
});

export default function VideoToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Video Tools", path: "/video-tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "QRix Video Tools",
            itemListElement: VIDEO_TOOLS.map((t, i) => ({
              "@type": "ListItem", position: i + 1, name: t.title, url: `${SITE_URL}/video-tools/${t.slug}`,
            })),
          },
        ])}
      />
      <VideoToolsLanding />
    </>
  );
}

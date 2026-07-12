import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import AnimatedQrClient from "@/components/AnimatedQrClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Animated QR Code Maker — Free QR Video for Stories & Reels",
  description: "Turn any link into a short animated QR video. The code materializes tile by tile with a shine and a SCAN ME call-to-action — download as MP4/WebM for Instagram Stories, Reels, TikTok and Shorts. Free, rendered on your device.",
  path: "/animated-qr",
  keywords: ["animated QR code", "QR code video", "QR animation maker", "QR for Instagram story", "scan me video", "QR reels"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Animated QR Code Maker", "Create short animated QR videos for Stories, Reels and Shorts — free and on-device.", "/animated-qr"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Animated QR Maker", path: "/animated-qr" }]),
        ])}
      />
      <ToolPageShell
        category="QR Tools"
        categoryHref="/qr-tools"
        title="Animated QR Maker"
        emoji="🎞️"
        grad="linear-gradient(135deg,#ff6a13,#e14e08)"
        intro="Turn any link into a short animated QR video — ready for Stories, Reels, TikTok and Shorts."
        about="The Animated QR Maker turns a plain code into a scroll-stopping clip: your QR materializes tile by tile over a branded backdrop, a light sweep polishes it, and a SCAN ME call-to-action pops in. Pick a story (9:16) or post (1:1) format, choose a theme, and record a 6-second MP4/WebM right in your browser — nothing is uploaded anywhere. Perfect for restaurant promos, event invites, giveaways and link-in-bio pushes where a static QR gets ignored."
        steps={[
          { title: "Paste your link", desc: "Any URL or text — the QR updates live." },
          { title: "Style it", desc: "Story or post format, three themes, your own CTA text." },
          { title: "Record & share", desc: "Download the 6-second video and post it anywhere." },
        ]}
      >
        <AnimatedQrClient />
      </ToolPageShell>
    </>
  );
}

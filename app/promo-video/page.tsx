import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import PromoVideoClient from "@/components/PromoVideoClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

const FAQS = [
  { q: "Is the promo video really made in my browser?", a: "Yes. Every frame is drawn on a canvas and recorded on your device — your text, logo and link never leave your computer, and there's nothing to upload or wait for." },
  { q: "What format do I get?", a: "Chrome, Edge and Safari save a real MP4; other browsers save WebM. Both upload cleanly to Instagram Reels/Stories, TikTok, YouTube Shorts, Facebook and ad platforms." },
  { q: "Can I add my own logo?", a: "Yes — upload any PNG or JPG and it appears in the opening scene. A link becomes a scannable QR code in the final call-to-action scene." },
  { q: "Is it free?", a: "Completely free — no watermark, no signup, no limits. Rendering runs on your device." },
  { q: "What sizes can I export?", a: "Story/Reel 9:16, Square 1:1 and Landscape 16:9 — pick the one that fits where you'll post it." },
];

const USE_CASES = [
  "Product launches and feature announcements for social feeds",
  "Restaurant, café and shop promos with a scannable menu or offer",
  "Event invites and countdowns for Stories and Reels",
  "App or SaaS promos with a download link as a QR",
  "Sale and discount campaigns for Instagram, TikTok and Facebook ads",
  "Link-in-bio and giveaway pushes that need motion to stop the scroll",
];

export const metadata: Metadata = pageMeta({
  title: "Promo Video Maker — Free Animated Promo Videos in Your Browser",
  description: "Turn a brand name, headline, a few benefits and a link into a short animated promo video — logo, QR code and call-to-action included. Export MP4/WebM for Reels, Stories, TikTok and ads. Free, on-device, no watermark.",
  path: "/promo-video",
  keywords: ["promo video maker", "free promo video", "animated video ad maker", "reels video maker", "product promo video", "social media video maker", "marketing video generator"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Promo Video Maker", "Create short animated promo videos for social media and ads — free and on-device.", "/promo-video"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Promo Video Maker", path: "/promo-video" }]),
          faqLd(FAQS),
        ])}
      />
      <ToolPageShell
        breadcrumbSchema={false}
        category="Video Tools"
        categoryHref="/video-tools"
        title="Promo Video Maker"
        emoji="🎬"
        grad="linear-gradient(135deg,#ff6a13,#e14e08)"
        intro="Turn your brand, message and link into a short animated promo video — ready for Reels, Stories, TikTok and ads."
        about="The Promo Video Maker builds a polished, animated promo from a few fields: your brand and logo open the film, your headline rises with an accent underline, your key benefits cascade in, and a call-to-action pops with a scannable QR of your link. Choose a story (9:16), square (1:1) or landscape (16:9) format, a colour theme and a length, then record an MP4/WebM right in your browser. Nothing is uploaded — every frame is rendered on your device, so it's instant, private and free with no watermark."
        steps={[
          { title: "Fill in your message", desc: "Brand, headline, a few benefits, a CTA and a link — the preview updates live." },
          { title: "Style it", desc: "Add your logo, pick a format, theme and length." },
          { title: "Record & share", desc: "Download the video and post it to Reels, Stories, TikTok or your ads." },
        ]}
        useCases={USE_CASES}
        faqs={FAQS}
      >
        <PromoVideoClient />
      </ToolPageShell>
    </>
  );
}

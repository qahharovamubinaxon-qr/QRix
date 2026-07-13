import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import QrArtClient from "@/components/QrArtClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "AI QR Code Art Generator — Free Beautiful Scannable QR Posters",
  description:
    "Turn a boring QR code into a scroll-stopping poster: AI generates a stunning background, your QR stays crisp and scannable. Free, no signup, rendered on your device.",
  path: "/qr-art",
  keywords: ["ai qr code art", "qr code art generator", "beautiful qr code", "qr code poster maker", "artistic qr code free", "aesthetic qr code"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("AI QR Code Art Generator", "Generate a beautiful AI background for your QR code and download a scannable poster — free and on-device.", "/qr-art"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "AI QR Art", path: "/qr-art" }]),
        ])}
      />
      <ToolPageShell
        category="QR Tools"
        categoryHref="/qr-tools"
        title="AI QR Art"
        emoji="🎨"
        grad="linear-gradient(135deg,#7c3aed,#ff6a13)"
        intro="Generate a gorgeous AI background for your QR code — a scroll-stopping poster your customers actually want to scan."
        about="Plain black-and-white QR codes get ignored. The AI QR Art generator creates a striking, on-brand background from a text prompt (sunset, neon city, nature, abstract and more) using a free image AI, then places your QR in a clean panel so it stays perfectly scannable. Pick a poster, square or story format, add a headline, and download a high-resolution PNG — free, no signup, and the final poster is composited right on your device. Perfect for cafés, events, packaging, social posts and shop windows where a beautiful code earns far more scans than a plain one."
        steps={[
          { title: "Add your link", desc: "The QR updates live and always stays scannable." },
          { title: "Pick an art style", desc: "Choose a style and add an optional prompt; hit Generate." },
          { title: "Download", desc: "Save a high-resolution PNG poster to print or post." },
        ]}
        useCases={[
          "A café or restaurant menu poster people actually want to scan",
          "Event and festival signage that stands out on the wall",
          "Product packaging and shop-window QR that matches your brand",
          "Eye-catching QR for Instagram, TikTok and link-in-bio posts",
        ]}
        faqs={[
          { q: "Will the artistic QR still scan?", a: "Yes — unlike blended 'QR illusions' that often fail, we keep your QR in a clean high-contrast panel over the art, so it scans reliably every time." },
          { q: "Is it really free?", a: "Yes. The AI background is generated on a free engine and the poster is composited in your browser — no signup, no watermark." },
          { q: "What formats can I make?", a: "Poster (4:5), Square (1:1) and Story (9:16) — ready for print, feeds and Stories." },
          { q: "Does my link get uploaded?", a: "Only the text prompt is sent to generate the background image; your QR and the final poster are built on your device." },
        ]}
      >
        <QrArtClient />
      </ToolPageShell>
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { QR_TOOLS } from "@/lib/qr-tools-meta";

/* page.tsx here is a client component, and a client component cannot export
   `metadata`. Without this layout Next falls back to the ROOT metadata, so the
   landing page served the homepage's title *and* the homepage's canonical —
   telling Google and Yandex it is a duplicate of "/" and should not rank.
   A layout can export metadata, so this fixes it without touching the page.
   Child routes (/qr-tools/[slug], /qr-tools/decode) export their own metadata,
   which overrides this. */
export const metadata: Metadata = pageMeta({
  title: "QR Code Tools — 32 Free Generators, No Signup",
  description:
    "Every QR code type in one place: URL, WiFi, vCard, WhatsApp, payment, crypto, app store, event and more. Free, unlimited, no watermark — generated in your browser.",
  path: "/qr-tools",
  keywords: [
    "qr code tools", "free qr code generator", "qr code types", "wifi qr code",
    "vcard qr code", "url qr code", "qr generator no signup", "make qr code online",
  ],
});

export default function QrToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "QR Tools", path: "/qr-tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "QRix QR Code Tools",
            itemListElement: QR_TOOLS.map((t, i) => ({
              "@type": "ListItem", position: i + 1, name: t.title, url: `${SITE_URL}/qr-tools/${t.slug}`,
            })),
          },
        ])}
      />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";
import { IMAGE_TOOLS } from "@/lib/image-tools-meta";

/* See app/qr-tools/layout.tsx — the page is a client component, so without this
   the landing inherited the homepage title and canonical and could not rank. */
export const metadata: Metadata = pageMeta({
  title: "Image Tools — Free Online Photo Editor, No Upload",
  description:
    "A full image studio in your browser: compress, resize, convert, crop, remove background, watermark, upscale and read text from a picture. Free and unlimited — nothing is uploaded.",
  path: "/image-tools",
  keywords: [
    "image tools", "free online photo editor", "compress image", "resize image",
    "convert image", "remove background", "crop image online", "image to text",
  ],
});

export default function ImageToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Image Tools", path: "/image-tools" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "QRix Image Tools",
            itemListElement: IMAGE_TOOLS.map((t, i) => ({
              "@type": "ListItem", position: i + 1, name: t.title, url: `${SITE_URL}/image-tools/${t.slug}`,
            })),
          },
        ])}
      />
      {children}
    </>
  );
}

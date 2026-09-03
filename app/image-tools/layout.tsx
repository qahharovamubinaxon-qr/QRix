import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

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
  return children;
}

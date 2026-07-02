import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import ExifCleanerClient from "@/components/ExifCleanerClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "EXIF Remover — Strip GPS & Metadata From Photos",
  description: "Photos secretly contain GPS location, device and timestamp metadata. Remove it all before sharing — free, private, runs entirely in your browser.",
  path: "/image-tools/exif-remover",
  keywords: ["remove EXIF data", "strip photo metadata", "remove GPS from photo", "EXIF remover online free"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("EXIF Remover", "Strip GPS location and all metadata from photos before sharing, free and in-browser.", "/image-tools/exif-remover"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Image Tools", path: "/image-tools" }, { name: "EXIF Remover", path: "/image-tools/exif-remover" }]),
        ])}
      />
      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools" title="EXIF Remover" emoji="📵"
        grad="linear-gradient(135deg,#16a34a,#4ade80)"
        intro="Strip hidden GPS location, device and timestamp data from photos before you share them."
        about="Every photo from a phone quietly embeds metadata: exact GPS coordinates of where it was taken, the device model, date and time, even editing software history. Anyone you send the photo to can read it. This tool re-encodes the image keeping only the visible pixels, so every trace of metadata is removed. It runs entirely in your browser — the photo never leaves your device."
        steps={[
          { title: "Upload a photo", desc: "JPG, PNG or WebP." },
          { title: "Clean", desc: "The image is re-encoded without any metadata." },
          { title: "Download", desc: "Share the clean copy safely." },
        ]}
      >
        <ExifCleanerClient />
      </ToolPageShell>
    </>
  );
}

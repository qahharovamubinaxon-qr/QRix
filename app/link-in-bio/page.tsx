import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import LinkInBioClient from "@/components/LinkInBioClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Free Link-in-Bio Page Maker — No Signup",
  description: "Build a beautiful link-in-bio page with multiple buttons, avatar and colors — free, no account, nothing stored. Share it as a link or QR code instantly.",
  path: "/link-in-bio",
  keywords: ["link in bio", "free linktree alternative", "bio link page", "multi link QR code", "link page maker"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Link-in-Bio Page Maker", "Create a free multi-link bio page and share it as a link or QR code — no signup.", "/link-in-bio"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Link-in-Bio", path: "/link-in-bio" }]),
        ])}
      />
      <ToolPageShell
        category="QR Tools"
        categoryHref="/qr-tools"
        title="Link-in-Bio Page"
        emoji="🔗"
        grad="linear-gradient(135deg,#7c3aed,#a78bfa)"
        intro="One page for all your links — free, instant, no signup. Share it as a link or QR code."
        about="Build a mini landing page with all your important links: website, socials, menu, payment — anything. Unlike other services, QRix needs no account and stores nothing: your entire page is encoded inside the share link itself, so it works forever and stays private. Put the QR on your counter, business card or packaging and let people tap through to everything you offer."
        steps={[
          { title: "Add your info", desc: "Name, bio, avatar and accent color." },
          { title: "Add links", desc: "Up to 8 buttons — website, socials, menu, payment…" },
          { title: "Share", desc: "Copy the link or download the QR code. Done." },
        ]}
      >
        <LinkInBioClient />
      </ToolPageShell>
    </>
  );
}

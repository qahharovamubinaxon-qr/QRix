import type { Metadata } from "next";
import ToolPageShell from "@/components/ToolPageShell";
import PosterMakerClient from "@/components/PosterMakerClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "QR Poster Maker — Free Printable 'Scan Me' Flyers",
  description: "Create a print-ready 'Scan me' poster in seconds. Pick a template (menu, review, follow, pay), add your link and your logo, customize colors and download as PDF or PNG.",
  path: "/poster",
  keywords: ["QR poster maker", "scan me poster", "QR flyer", "printable QR code", "restaurant menu QR poster", "QR poster with logo"],
});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("QR Poster Maker", "Create print-ready 'Scan me' QR posters and flyers for free.", "/poster"),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "QR Poster Maker", path: "/poster" }]),
        ])}
      />
      <ToolPageShell
        category="QR Tools"
        categoryHref="/qr-tools"
        title="QR Poster Maker"
        emoji="🖼️"
        grad="linear-gradient(135deg,#F58F20,#e07a10)"
        intro="Design a print-ready 'Scan me' poster or flyer and download it as PDF or PNG."
        about="The QR Poster Maker turns any link into a beautiful, print-ready A4 poster. Choose a ready-made template — menu, review, follow, pay or website — add your link, drop in your logo, tweak the heading and colors, and download a crisp PDF for printing or a PNG for sharing. The logo is read in your browser and never uploaded, and the small 'Made with QRix' credit comes off with one checkbox. Perfect for restaurants, shops, events and offices that want customers to scan and act."
        steps={[
          { title: "Pick a template", desc: "Menu, Review, Follow, Pay, Website or Custom." },
          { title: "Add your link, logo & text", desc: "Paste the URL, upload your logo and edit the heading and subtext." },
          { title: "Download", desc: "Save a print-ready PDF (A4) or a PNG image." },
        ]}
      >
        <PosterMakerClient />
      </ToolPageShell>
    </>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import WatermarkClient from "@/components/WatermarkClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Add Watermark — Free Online Tool", description: "Stamp a text watermark across every page of your PDF.", path: "/pdf-tools/watermark" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Add Watermark" emoji="💧"
      grad="linear-gradient(135deg,#0891b2,#22d3ee)"
      intro="Stamp a text watermark across every page of your PDF."
      about="A watermark overlays semi-transparent text (like CONFIDENTIAL, DRAFT or your brand name) across all pages. You control the text, opacity and whether it sits diagonally. Useful for protecting drafts, marking ownership and preventing unauthorized copying. Processing happens locally in your browser."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to watermark." },
        { title: "Set text & opacity", desc: "Type the watermark text and adjust transparency." },
        { title: "Download", desc: "Save the watermarked PDF." },
      ]}>
      <WatermarkClient />
    </ToolPageShell>
  );
}

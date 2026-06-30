import ToolPageShell from "@/components/ToolPageShell";
import RotatePdfClient from "@/components/RotatePdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Rotate PDF — Free Online Tool", description: "Rotate PDF pages to the correct orientation.", path: "/pdf-tools/rotate" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Rotate PDF" emoji="🔄"
      grad="linear-gradient(135deg,#0d9488,#2dd4bf)"
      intro="Rotate PDF pages to the correct orientation."
      about="This tool rotates pages by 90°, 180° or 270°. Fix sideways or upside-down scans, or rotate specific pages only. Enter page numbers to target certain pages, or leave empty to rotate the whole document. Runs in your browser."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to rotate." },
        { title: "Pick angle & pages", desc: "Select rotation and which pages to apply it to." },
        { title: "Download", desc: "Save the rotated PDF." },
      ]}>
      <RotatePdfClient />
    </ToolPageShell>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import ReorderPdfClient from "@/components/ReorderPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Reorder Pages — Free Online Tool", description: "Rearrange the pages of your PDF into a new order.", path: "/pdf-tools/reorder" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Reorder Pages" emoji="🔀"
      grad="linear-gradient(135deg,#7c3aed,#a78bfa)"
      intro="Rearrange the pages of your PDF into a new order."
      about="This tool lets you move pages up or down to change their order, then download the reorganized PDF. Useful for fixing the sequence of scanned pages or reordering sections. Everything runs locally in your browser."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to reorder." },
        { title: "Move pages", desc: "Use the arrows to set the new page order." },
        { title: "Download", desc: "Save the reordered PDF." },
      ]}>
      <ReorderPdfClient />
    </ToolPageShell>
  );
}

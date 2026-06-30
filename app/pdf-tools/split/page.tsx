import ToolPageShell from "@/components/ToolPageShell";
import SplitPdfClient from "@/components/SplitPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Split PDF — Free Online Tool", description: "Extract selected pages or split your PDF into separate files.", path: "/pdf-tools/split" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Split PDF" emoji="✂️"
      grad="linear-gradient(135deg,#0891b2,#22d3ee)"
      intro="Extract selected pages or split your PDF into separate files."
      about="Splitting lets you break a large PDF into smaller pieces or pull out specific pages. Useful when you only need a few pages from a big document, or want to separate chapters. Upload your PDF and choose the pages to extract."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to split." },
        { title: "Select pages", desc: "Pick which pages to extract." },
        { title: "Download", desc: "Save the resulting PDF." },
      ]}>
      <SplitPdfClient />
    </ToolPageShell>
  );
}

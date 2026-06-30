import ToolPageShell from "@/components/ToolPageShell";
import JpgToPdfClient from "@/components/JpgToPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "JPG to PDF — Free Online Tool", description: "Combine images (JPG, PNG) into a single PDF file.", path: "/pdf-tools/jpg-to-pdf" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="JPG to PDF" emoji="📄"
      grad="linear-gradient(135deg,#dc2626,#f87171)"
      intro="Combine images (JPG, PNG) into a single PDF file."
      about="This tool turns your images into a PDF document. Upload one or more JPG or PNG files and they'll be placed into a single, shareable PDF — perfect for turning photos of documents, receipts or notes into a proper PDF."
      steps={[
        { title: "Upload images", desc: "Choose one or more JPG / PNG files." },
        { title: "Convert", desc: "Images are combined into one PDF." },
        { title: "Download", desc: "Save the PDF file." },
      ]}>
      <JpgToPdfClient />
    </ToolPageShell>
  );
}

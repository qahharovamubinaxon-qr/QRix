import ToolPageShell from "@/components/ToolPageShell";
import PdfToTextClient from "@/components/PdfToTextClient";

export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="PDF to Text" emoji="📃"
      grad="linear-gradient(135deg,#0891b2,#22d3ee)"
      intro="Extract all selectable text from a PDF and download it as a .txt file."
      about="This tool reads the embedded text layer of your PDF and extracts it page by page. Perfect for copying content out of reports, articles or contracts. If your PDF is a scan (image only), use the OCR PDF tool instead, which recognizes text from the page images."
      steps={[
        { title: "Upload a PDF", desc: "Choose a PDF that contains real (selectable) text." },
        { title: "Extract", desc: "Text is pulled from every page in seconds." },
        { title: "Copy or download", desc: "Copy to clipboard or save as a .txt file." },
      ]}>
      <PdfToTextClient />
    </ToolPageShell>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import OcrPdfClient from "@/components/OcrPdfClient";
import { pageMeta } from "@/lib/seo";


export const metadata = pageMeta({ title: "OCR PDF — Free Online Tool", description: "Recognize text from scanned PDFs and images using OCR.", path: "/pdf-tools/ocr" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="OCR PDF" emoji="🔍"
      grad="linear-gradient(135deg,#ea580c,#fb923c)"
      intro="Recognize text from scanned PDFs and images using OCR."
      about="OCR (Optical Character Recognition) reads the text inside scanned or image-based PDFs that have no selectable text. Each page is rendered and analyzed, and the recognized text is returned for you to copy or download. Supports English, Russian and Uzbek. Everything runs privately in your browser — your file never leaves your device."
      steps={[
        { title: "Upload a scanned PDF", desc: "Choose a PDF made of page images." },
        { title: "Pick the language", desc: "Select the language of the document." },
        { title: "Run OCR", desc: "Copy or download the recognized text." },
      ]}>
      <OcrPdfClient />
    </ToolPageShell>
  );
}

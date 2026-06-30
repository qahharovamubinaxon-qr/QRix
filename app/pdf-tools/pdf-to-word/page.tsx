import ToolPageShell from "@/components/ToolPageShell";
import PdfToWordClient from "@/components/PdfToWordClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "PDF to Word — Free Online Tool", description: "Convert PDF documents into editable Word files.", path: "/pdf-tools/pdf-to-word" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="PDF to Word" emoji="📝"
      grad="linear-gradient(135deg,#2563eb,#60a5fa)"
      intro="Convert PDF documents into editable Word files."
      about="This tool extracts the text and layout from your PDF and produces an editable Word document. Useful when you need to edit content that's locked in a PDF. Works best with text-based PDFs; scanned documents use OCR where available."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to convert." },
        { title: "Convert", desc: "The tool extracts text into Word format." },
        { title: "Download", desc: "Save the editable .docx file." },
      ]}>
      <PdfToWordClient />
    </ToolPageShell>
  );
}

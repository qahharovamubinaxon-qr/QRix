import ToolPageShell from "@/components/ToolPageShell";
import WordToPdfClient from "@/components/WordToPdfClient";
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Word to PDF" emoji="📄"
      grad="linear-gradient(135deg,#1d4ed8,#3b82f6)"
      intro="Convert Word documents into clean PDF files."
      about="This tool converts your Word (.docx) document into a PDF that looks the same on any device. PDFs are ideal for sharing final documents, printing and archiving because their layout never changes."
      steps={[
        { title: "Upload a Word file", desc: "Choose a .docx document." },
        { title: "Convert", desc: "The tool renders it as a PDF." },
        { title: "Download", desc: "Save the PDF file." },
      ]}>
      <WordToPdfClient />
    </ToolPageShell>
  );
}

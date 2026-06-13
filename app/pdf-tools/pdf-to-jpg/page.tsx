import ToolPageShell from "@/components/ToolPageShell";
import PdfToJpgClient from "@/components/PdfToJpgClient";
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="PDF to JPG" emoji="🖼️"
      grad="linear-gradient(135deg,#db2777,#f472b6)"
      intro="Convert each PDF page into a high-quality JPG image."
      about="This tool turns every page of your PDF into a separate JPG image. Great for sharing pages on social media, embedding in documents, or viewing without a PDF reader. Each page is rendered at high resolution."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to convert." },
        { title: "Convert", desc: "Each page becomes a JPG image." },
        { title: "Download", desc: "Save the images to your device." },
      ]}>
      <PdfToJpgClient />
    </ToolPageShell>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import PdfToPngClient from "@/components/PdfToPngClient";

export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="PDF to PNG" emoji="🌅"
      grad="linear-gradient(135deg,#7c3aed,#a78bfa)"
      intro="Convert each PDF page into a high-resolution PNG image."
      about="This tool renders every page of your PDF as a crisp PNG image with transparency support and lossless quality. Ideal for slides, diagrams and graphics where you need the sharpest possible image. All pages are bundled into a single ZIP for easy download."
      steps={[
        { title: "Upload a PDF", desc: "Pick the document to convert." },
        { title: "Convert", desc: "Each page is rendered to a high-res PNG." },
        { title: "Download ZIP", desc: "Get all images in one ZIP file." },
      ]}>
      <PdfToPngClient />
    </ToolPageShell>
  );
}

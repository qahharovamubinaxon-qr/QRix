import ToolPageShell from "@/components/ToolPageShell";
import CropPdfClient from "@/components/CropPdfClient";

export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Crop PDF" emoji="✂️"
      grad="linear-gradient(135deg,#16a34a,#4ade80)"
      intro="Trim the margins of every page to focus on the content."
      about="This tool sets a crop box on each page to remove unwanted white margins. Useful for tightening scanned documents, removing borders, or preparing pages for printing and presentations. The crop is non-destructive — the original content stays, only the visible area changes."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to crop." },
        { title: "Set the margin", desc: "Pick how much to trim from each side." },
        { title: "Download", desc: "Save your cropped PDF." },
      ]}>
      <CropPdfClient />
    </ToolPageShell>
  );
}

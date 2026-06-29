import ToolPageShell from "@/components/ToolPageShell";
import SignPdfClient from "@/components/SignPdfClient";

export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Sign PDF" emoji="✍️"
      grad="linear-gradient(135deg,#2563eb,#60a5fa)"
      intro="Draw or upload your signature and place it on your PDF."
      about="Add a handwritten signature to any PDF. Draw it right in your browser or upload a signature image, choose where it goes and how big it is, then download the signed document. Everything happens locally — your file and signature never leave your device."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to sign." },
        { title: "Add your signature", desc: "Draw it or upload a transparent PNG." },
        { title: "Place & download", desc: "Pick position, page and size, then save." },
      ]}>
      <SignPdfClient />
    </ToolPageShell>
  );
}

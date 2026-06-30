import ToolPageShell from "@/components/ToolPageShell";
import CompressPdfClient from "@/components/CompressPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Compress PDF — Free Online Tool", description: "Reduce your PDF file size while keeping good quality.", path: "/pdf-tools/compress" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Compress PDF" emoji="🗜️"
      grad="linear-gradient(135deg,#16a34a,#4ade80)"
      intro="Reduce your PDF file size while keeping good quality."
      about="Compression shrinks the file size of a PDF so it's easier to email, upload or store. The tool optimizes images and content to reduce size with minimal quality loss. Ideal for large scanned documents and presentations."
      steps={[
        { title: "Upload a PDF", desc: "Choose the file you want to compress." },
        { title: "Compress", desc: "The tool reduces the size automatically." },
        { title: "Download", desc: "Save the smaller PDF." },
      ]}>
      <CompressPdfClient />
    </ToolPageShell>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import ImageEditClient from "@/components/ImageEditClient";
import { pageMeta } from "@/lib/seo";


export const metadata = pageMeta({ title: "Convert Image — Free Online Tool", description: "Convert images between JPG, PNG and WebP formats in one click.", path: "/image-tools/convert" });
export default function ConvertImagePage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Convert Image" emoji="🔄"
      grad="linear-gradient(135deg,#db2777,#f472b6)"
      intro="Convert images between JPG, PNG and WebP formats in one click."
      about="Different formats serve different needs: JPG is best for photos (small size), PNG keeps transparency and sharp edges, and WebP gives the best compression for the web. This converter changes the format while preserving quality, entirely in your browser. Convert a PNG screenshot to JPG to email it, or to WebP to speed up your website."
      steps={[
        { title: "Upload an image", desc: "Choose any JPG, PNG or WebP file." },
        { title: "Choose target format", desc: "Select JPG, PNG or WebP as the output." },
        { title: "Convert & download", desc: "Click Convert and save the new file." },
      ]}
    >
      <ImageEditClient mode="convert" />
    </ToolPageShell>
  );
}

import ToolPageShell from "@/components/ToolPageShell";
import ImageEditClient from "@/components/ImageEditClient";

export default function CompressImagePage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Compress Image" emoji="🗜️"
      grad="linear-gradient(135deg,#16a34a,#4ade80)"
      intro="Reduce image file size while keeping good visual quality — perfect for web and email."
      about="Large images slow down websites and fill up storage. This tool re-encodes your image at an adjustable quality level to dramatically shrink the file size, all in your browser. Lower quality = smaller file. For photos, 70–85% usually looks identical to the original while saving 50–80% of the size. Nothing is uploaded — compression happens locally and instantly."
      steps={[
        { title: "Upload an image", desc: "Choose a JPG, PNG or WebP file." },
        { title: "Adjust quality", desc: "Drag the slider to balance size and quality." },
        { title: "Compress & download", desc: "See how much smaller it got, then download." },
      ]}
    >
      <ImageEditClient mode="compress" />
    </ToolPageShell>
  );
}

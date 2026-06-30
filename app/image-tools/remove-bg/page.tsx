import ToolPageShell from "@/components/ToolPageShell";
import RemoveBgClient from "@/components/RemoveBgClient";
import { pageMeta } from "@/lib/seo";


export const metadata = pageMeta({ title: "Background Remover — Free Online Tool", description: "Remove the background from any image automatically with AI — right in your browser.", path: "/image-tools/remove-bg" });
export default function RemoveBgPage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Background Remover" emoji="✂️"
      grad="linear-gradient(135deg,#7c3aed,#a855f7)"
      intro="Remove the background from any image automatically with AI — right in your browser."
      about="This tool uses an AI segmentation model that runs entirely in your browser. Your image is never uploaded to any server, so it stays completely private. The result is a transparent PNG you can use for product photos, profile pictures, logos, stickers and presentations. The first run downloads the AI model once (a few MB); after that it works instantly even offline."
      steps={[
        { title: "Upload an image", desc: "Choose a JPG, PNG or WebP file with a clear subject." },
        { title: "Remove background", desc: "Click the button — the AI detects the subject and cuts the background." },
        { title: "Download PNG", desc: "Save the transparent result and use it anywhere." },
      ]}
    >
      <RemoveBgClient />
    </ToolPageShell>
  );
}

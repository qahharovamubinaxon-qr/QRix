import ToolPageShell from "@/components/ToolPageShell";
import ImageUpscaleClient from "@/components/ImageUpscaleClient";
import { pageMeta } from "@/lib/seo";


export const metadata = pageMeta({ title: "Image Enhancer — Free Online Tool", description: "Upscale and sharpen blurry or low-resolution images to make them clearer and larger.", path: "/image-tools/upscale" });
export default function UpscalePage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Image Enhancer" emoji="✨"
      grad="linear-gradient(135deg,#f59e0b,#fbbf24)"
      intro="Upscale and sharpen blurry or low-resolution images to make them clearer and larger."
      about="This tool enlarges your image 2×, 3× or 4× using high-quality interpolation, then applies a sharpening filter to bring back crisp edges and details. It's perfect for small thumbnails, old photos, or slightly blurry pictures you want to print or post in higher resolution. Everything runs locally in your browser — your image is never uploaded. For very low-quality images, try 2× with sharpening first for the most natural result."
      steps={[
        { title: "Upload an image", desc: "Choose a small or blurry image you want to improve." },
        { title: "Pick a scale", desc: "Select 2×, 3× or 4× and keep 'Sharpen' on for blurry photos." },
        { title: "Enhance & download", desc: "Click Enhance, then download the larger, sharper image." },
      ]}
    >
      <ImageUpscaleClient />
    </ToolPageShell>
  );
}

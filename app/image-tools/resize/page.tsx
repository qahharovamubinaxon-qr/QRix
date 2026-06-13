import ToolPageShell from "@/components/ToolPageShell";
import ImageEditClient from "@/components/ImageEditClient";

export default function ResizeImagePage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Resize Image" emoji="📐"
      grad="linear-gradient(135deg,#2563eb,#60a5fa)"
      intro="Change the dimensions of your image to exact pixel sizes, with optional aspect-ratio lock."
      about="Resizing is useful for fitting images into specific places: social media posts, thumbnails, avatars or print layouts. Keep 'Lock aspect ratio' on to avoid stretching — changing width updates height automatically. You can also choose the output format. All processing happens in your browser; your image never leaves your device."
      steps={[
        { title: "Upload an image", desc: "Choose the image you want to resize." },
        { title: "Enter dimensions", desc: "Type a new width or height; ratio stays locked by default." },
        { title: "Resize & download", desc: "Pick a format and download the resized image." },
      ]}
    >
      <ImageEditClient mode="resize" />
    </ToolPageShell>
  );
}

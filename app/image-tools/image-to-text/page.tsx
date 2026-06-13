import ToolPageShell from "@/components/ToolPageShell";
import ImageToTextClient from "@/components/ImageToTextClient";

export default function ImageToTextPage() {
  return (
    <ToolPageShell
      category="Image Tools" categoryHref="/image-tools"
      title="Image to Text (OCR)" emoji="🔤"
      grad="linear-gradient(135deg,#0891b2,#22d3ee)"
      intro="Extract text from images, screenshots and scanned documents in multiple languages."
      about="Optical Character Recognition (OCR) reads text inside an image and turns it into editable, copyable text. This tool supports English, Russian and Uzbek (including mixed text). It runs locally in your browser, so your images stay private. Great for digitizing receipts, book pages, screenshots, business cards and notes. For best accuracy use a sharp, well-lit image where the text is clearly visible and not rotated."
      steps={[
        { title: "Upload an image", desc: "Choose an image that contains text." },
        { title: "Pick the language", desc: "Select the language(s) of the text for better accuracy." },
        { title: "Extract & copy", desc: "Click Extract, then edit, copy or download the text as .txt." },
      ]}
    >
      <ImageToTextClient />
    </ToolPageShell>
  );
}

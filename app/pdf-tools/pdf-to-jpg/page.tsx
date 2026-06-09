import PdfToJpgClient from "@/components/PdfToJpgClient";

export default function PdfToJpgPage() {
  return (
    <div className="max-w-5xl mx-auto p-10 text-white">

      <h1 className="text-5xl font-bold mb-4">
        PDF to JPG
      </h1>

      <p className="text-zinc-400 mb-8">
        Convert PDF pages into JPG images.
      </p>

      <PdfToJpgClient />

    </div>
  );
}
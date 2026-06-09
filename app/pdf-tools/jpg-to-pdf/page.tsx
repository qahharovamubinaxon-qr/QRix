import JpgToPdfClient from "@/components/JpgToPdfClient";

export default function JpgToPdfPage() {
  return (
    <div className="max-w-5xl mx-auto p-10 text-white">
      <h1 className="text-5xl font-bold mb-4">
        JPG to PDF
      </h1>

      <p className="text-zinc-400 mb-8">
        Convert JPG images into a PDF file.
      </p>

      <JpgToPdfClient />
    </div>
  );
}
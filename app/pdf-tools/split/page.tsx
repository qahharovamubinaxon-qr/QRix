import SplitPdfClient from "@/components/SplitPdfClient";

export default function SplitPdfPage() {
  return (
    <div className="max-w-5xl mx-auto p-10 text-white">
      <h1 className="text-5xl font-bold mb-4">
        Split PDF
      </h1>

      <p className="text-zinc-400 mb-8">
        Upload a PDF and extract selected pages.
      </p>

      <SplitPdfClient />
    </div>
  );
}
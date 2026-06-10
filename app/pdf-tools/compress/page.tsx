import CompressPdfClient from "@/components/CompressPdfClient";

export default function CompressPdfPage() {
  return (
    <div className="p-10 text-white">

      <h1 className="text-5xl font-bold mb-4">
        Compress PDF
      </h1>

      <p className="text-zinc-400 mb-8">
        Reduce PDF file size
      </p>

      <CompressPdfClient />

    </div>
  );
}
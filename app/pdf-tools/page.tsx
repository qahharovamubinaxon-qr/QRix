import Link from "next/link";

export default function PdfToolsPage() {
  return (
    <div className="p-10 text-white">
      <h1 className="text-5xl font-bold mb-10">
        PDF Tools
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <Link
          href="/pdf-tools/merge"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          Merge PDF
        </Link>

        <Link
          href="/pdf-tools/split"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          Split PDF
        </Link>

        <Link
          href="/pdf-tools/pdf-to-jpg"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          PDF to JPG
        </Link>

        <Link
          href="/pdf-tools/jpg-to-pdf"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          JPG to PDF
        </Link>

        {/* ✅ ЯНГИ ҚЎШИЛДИ */}
        <Link
          href="/pdf-tools/pdf-to-word"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          PDF to Word
        </Link>

        <Link
          href="/pdf-tools/word-to-pdf"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          Word to PDF
        </Link>
       
        <Link
          href="/pdf-tools/compress"
          className="bg-zinc-900 p-8 rounded-3xl"
        >
          Compress PDF
        </Link>

      </div>
    </div>
  );
}
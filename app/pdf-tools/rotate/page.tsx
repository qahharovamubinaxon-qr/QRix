import ReorderPdfClient from "@/components/ReorderPdfClient";

export default function ReorderPdfPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-10">
      <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
        Reorder Pages
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
        Rearrange pages in your PDF file and download the result.
      </p>
      <ReorderPdfClient />
    </div>
  );
}

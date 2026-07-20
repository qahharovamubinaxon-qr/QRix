import ToolPageShell from "@/components/ToolPageShell";
import MergePdfClient from "@/components/MergePdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Merge PDF — Free Online Tool", description: "Combine multiple PDF files into one single document.", path: "/pdf-tools/merge", languages: { en: "/pdf-tools/merge", ru: "/ru/merge", uz: "/uz/merge", "x-default": "/pdf-tools/merge" } });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Merge PDF" emoji="📚"
      grad="linear-gradient(135deg,#4f46e5,#818cf8)"
      intro="Combine multiple PDF files into one single document."
      about="Merging joins several PDFs into a single file in the order you choose. Perfect for combining scanned pages, reports, invoices or chapters into one document. Add two or more files and download the merged result. Your files are processed securely."
      steps={[
        { title: "Select PDF files", desc: "Choose two or more PDFs to combine." },
        { title: "Check the order", desc: "Files merge in the order shown — remove any you don't need." },
        { title: "Merge & download", desc: "Click Merge and save the combined PDF." },
      ]}>
      <MergePdfClient />
    </ToolPageShell>
  );
}

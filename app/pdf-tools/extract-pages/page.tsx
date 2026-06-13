import ToolPageShell from "@/components/ToolPageShell";
import PageSelectClient from "@/components/PageSelectClient";
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Extract Pages" emoji="📑"
      grad="linear-gradient(135deg,#16a34a,#4ade80)"
      intro="Pull out specific pages into a brand-new PDF."
      about="This tool keeps only the pages you choose and puts them into a new PDF, discarding the rest. Enter single pages and ranges like 2,4,6-9. Perfect for sharing just a chapter, a single invoice from a batch, or selected pages of a report. Everything runs locally in your browser."
      steps={[
        { title: "Upload a PDF", desc: "Choose the source document." },
        { title: "List pages to keep", desc: "Type the pages to extract, e.g. 2,4,6-9." },
        { title: "Download", desc: "Save the new PDF with only those pages." },
      ]}>
      <PageSelectClient mode="extract" />
    </ToolPageShell>
  );
}

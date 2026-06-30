import ToolPageShell from "@/components/ToolPageShell";
import PageSelectClient from "@/components/PageSelectClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Delete Pages — Free Online Tool", description: "Remove unwanted pages from your PDF and keep the rest.", path: "/pdf-tools/delete-pages" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Delete Pages" emoji="🗑️"
      grad="linear-gradient(135deg,#dc2626,#f87171)"
      intro="Remove unwanted pages from your PDF and keep the rest."
      about="This tool deletes the pages you specify and keeps everything else, creating a new clean PDF. Enter single pages and ranges like 1,3,5-8. Great for removing blank pages, ads or sections you don't need. Runs entirely in your browser — nothing is uploaded."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document to edit." },
        { title: "List pages to delete", desc: "Type page numbers and ranges, e.g. 1,3,5-8." },
        { title: "Download", desc: "Save the PDF without those pages." },
      ]}>
      <PageSelectClient mode="delete" />
    </ToolPageShell>
  );
}

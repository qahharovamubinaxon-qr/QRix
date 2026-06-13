import ToolPageShell from "@/components/ToolPageShell";
import PageNumbersClient from "@/components/PageNumbersClient";
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Add Page Numbers" emoji="🔢"
      grad="linear-gradient(135deg,#7c3aed,#a78bfa)"
      intro="Add automatic page numbers to your PDF in any position and format."
      about="This tool stamps page numbers onto every page of your PDF. Choose where they appear (corners or center, top or bottom) and the format (plain number, 'n / total', or 'Page n'). Everything runs in your browser — your file is never uploaded. Perfect for reports, contracts, books and assignments that need clear pagination."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document you want to number." },
        { title: "Choose position & format", desc: "Pick where numbers go and how they look." },
        { title: "Download", desc: "Save the numbered PDF instantly." },
      ]}>
      <PageNumbersClient />
    </ToolPageShell>
  );
}

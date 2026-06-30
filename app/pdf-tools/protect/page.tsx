import ToolPageShell from "@/components/ToolPageShell";
import ProtectPdfClient from "@/components/ProtectPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Protect PDF — Free Online Tool", description: "Add a password to your PDF so only people with the password can open it.", path: "/pdf-tools/protect" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Protect PDF" emoji="🔒"
      grad="linear-gradient(135deg,#6366f1,#8b5cf6)"
      intro="Add a password to your PDF so only people with the password can open it."
      about="This tool encrypts your PDF with a password. Once protected, the file cannot be opened, viewed or printed without entering the correct password. Encryption happens entirely in your browser — your file and password are never uploaded to any server. Ideal for sensitive documents like contracts, financial reports and personal records."
      steps={[
        { title: "Upload a PDF", desc: "Choose the document you want to protect." },
        { title: "Set a password", desc: "Enter and confirm a password (at least 4 characters)." },
        { title: "Download", desc: "Save the encrypted, password-protected PDF." },
      ]}>
      <ProtectPdfClient />
    </ToolPageShell>
  );
}

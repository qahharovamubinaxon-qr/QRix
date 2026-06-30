import ToolPageShell from "@/components/ToolPageShell";
import UnlockPdfClient from "@/components/UnlockPdfClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Unlock PDF — Free Online Tool", description: "Remove password protection from a PDF you can already open.", path: "/pdf-tools/unlock" });
export default function Page() {
  return (
    <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title="Unlock PDF" emoji="🔓"
      grad="linear-gradient(135deg,#d97706,#fbbf24)"
      intro="Remove password protection from a PDF you can already open."
      about="This tool removes the password from an encrypted PDF, producing a normal file that opens without any password. You must know the current password to unlock it — this is not a password-cracking tool. Everything runs in your browser, so your file and password stay private. Only use this on documents you own or are authorized to unlock."
      steps={[
        { title: "Upload a protected PDF", desc: "Choose the password-protected file." },
        { title: "Enter the password", desc: "Type the current password of the PDF." },
        { title: "Download", desc: "Save the unlocked PDF — no password needed anymore." },
      ]}>
      <UnlockPdfClient />
    </ToolPageShell>
  );
}

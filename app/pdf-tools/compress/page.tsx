import ToolPageShell from "@/components/ToolPageShell";
import CompressPdfClient from "@/components/CompressPdfClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, howToLd, faqLd } from "@/lib/seo";

const TITLE = "Compress PDF";
const DESC = "Reduce your PDF file size in your browser — no upload, no size limit, no watermark.";
const PATH = "/pdf-tools/compress";

const STEPS: { title: string; desc: string }[] = [
  { title: "Choose a PDF", desc: "It opens locally — nothing is uploaded." },
  { title: "Pick a level", desc: "Low keeps photo detail; high makes the smallest file." },
  { title: "Download", desc: "Save the smaller PDF and attach it anywhere." },
];

const FAQS = [
  { q: "Is my file uploaded?", a: "No. Compression runs in your browser, so the PDF never leaves your device — there is no server to send it to and nothing to delete afterwards." },
  { q: "How big a file can it handle?", a: "Only your device's memory limits it. A 50 MB scan is fine on a normal laptop or phone, because your browser is doing the work instead of an upload." },
  { q: "Will the text stay sharp?", a: "Yes — text is stored as vectors and is never re-encoded. Only the embedded photos are, so at the highest setting you may see softness in images and none in the type." },
  { q: "Why did my PDF barely shrink?", a: "Because it had no photos to shrink — a text or vector document is already close to its smallest size. When re-encoding would not help, the original file is handed back rather than a larger copy of it." },
];

export const metadata = pageMeta({
  title: "Compress PDF — Free Online Tool", description: DESC, path: PATH,
  languages: { en: PATH, ru: "/ru/compress", uz: "/uz/compress", "x-default": PATH },
});

export default function Page() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(TITLE, DESC, PATH),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "PDF Tools", path: "/pdf-tools" }, { name: TITLE, path: PATH }]),
          howToLd("How to compress a PDF", DESC, PATH, STEPS.map((s) => [s.title, s.desc] as [string, string])),
          faqLd(FAQS),
        ])}
      />
      <ToolPageShell category="PDF Tools" categoryHref="/pdf-tools" title={TITLE} emoji="🗜️"
        grad="linear-gradient(135deg,#16a34a,#4ade80)"
        intro="Reduce your PDF file size in your browser — no upload, no size limit."
        about="Compression shrinks the file size of a PDF so it's easier to email, upload or store. Nearly all the weight in a scan or an export is its embedded photos, so that is what this re-encodes — text, vectors, links and form fields are written back untouched. It all runs in your browser, which means a 50 MB scan is no harder than a small one and the document never leaves your device."
        steps={STEPS}
        faqs={FAQS}>
        <CompressPdfClient />
      </ToolPageShell>
    </>
  );
}

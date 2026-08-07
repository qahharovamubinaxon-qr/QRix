import Link from "next/link";
import ToolPageShell from "@/components/ToolPageShell";
import DocScanLoader from "@/components/scan/DocScanLoader";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";

/* Photograph a document, get back something that looks scanned, at its real
   printed size. Its own route rather than a slug under /image-tools because
   "document scanner online", "scan id card to pdf" and "id card both sides on
   one page" are their own queries, and a hub cannot rank for them from inside
   another family. Linked from /image-tools and /pdf-tools, both indexed —
   M147e's lesson about pages that live only in the sitemap. */

export const metadata = pageMeta({
  title: "Document Scanner — Photo to Clean Scan at True Size, Free",
  description:
    "Photograph an ID card, passport page or certificate and get a straightened, evenly lit scan placed on A4 at its real millimetre size. Both sides on one sheet. Runs in your browser; nothing is uploaded.",
  path: "/document-scanner",
  keywords: [
    "document scanner online", "scan id card to pdf", "id card both sides one page",
    "passport scan a4", "phone photo to scan", "straighten document photo",
  ],
});

const STEPS: [string, string][] = [
  ["Photograph the document", "A phone photo on a table is fine — crooked, angled and unevenly lit are the cases this exists for."],
  ["Check the four corners", "The edges are detected automatically. Drag any corner that is off; the preview follows immediately."],
  ["Pick the document type", "ID-1 for a card, ID-3 for a passport page, or a paper size. This sets the real printed dimensions."],
  ["Download the PDF", "One sheet, the document centred at its true size. Add the back of a card and both land on the same page."],
];

const FAQS = [
  {
    q: "Is my passport or ID uploaded to a server?",
    a: "No. The detection, the perspective correction and the page layout all run in your browser, and the photo never leaves the device. That is the reason to use this rather than an online converter for an identity document.",
  },
  {
    q: "Will the printed size be correct?",
    a: "Yes, if you print at 100% with no scaling. An ID-1 card is placed at 85.6 × 54 mm and a passport page at 125 × 88 mm — the ISO/IEC 7810 sizes — rendered at 300 DPI, so an ID card measures 85.6 mm against a ruler.",
  },
  {
    q: "It did not find my document. What now?",
    a: "Drag the four corner dots onto the document's corners — the result updates as you drag. Automatic detection struggles when the document is nearly the same brightness as the surface, when a patterned tablecloth competes with it, or when a hand is in frame; a plainer, darker background fixes most of it.",
  },
  {
    q: "Can I put the front and back of a card on one page?",
    a: "Yes. Add the second photo and both are corrected, sized identically and stacked on one sheet with a 10 mm gap between them.",
  },
  {
    q: "Why does the result look flat compared with the photo?",
    a: "The lighting is divided out on purpose. A phone photo carries a shadow gradient and a colour cast from whatever light was in the room; removing them is what makes the output read as a scan. Turn off \"clean up lighting\" to keep the photo as it was.",
  },
  {
    q: "Which formats can I download?",
    a: "A PDF sized to the sheet, or the image itself. The PDF is the one to send to an office — the page is sized in points so printing at 100% gives the right physical size.",
  },
];

export default function DocumentScannerPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd("Document Scanner", "Turn a phone photo of a document into a straightened, evenly lit scan at its true printed size.", "/document-scanner"),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Document Scanner", path: "/document-scanner" },
          ]),
          howToLd("Scan a document with a phone photo", "Photograph a document and produce a straightened scan at its real size.", "/document-scanner", STEPS),
          faqLd(FAQS),
        ])} />

      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title="Document Scanner" emoji="🪪"
        grad="linear-gradient(135deg,#ff6a13,#e14e08)"
        intro="Photograph an ID card, a passport page or a certificate and get back a straightened, evenly lit scan — placed on A4 at its real millimetre size."
        about={
          "A phone photo of a document is not a scan. It is taken at an angle, so the page is a trapezoid rather than a rectangle; it carries a shadow from the hand holding the phone; and it has no size at all — nothing in the file says the card was 85.6 mm wide.\n\n" +
          "This fixes all three. The document's corners are found and the perspective is undone, so the edges come out parallel. The lighting is estimated and divided out, which is what removes the grey wash on one side and makes the result read as scanned rather than photographed. Then the page is laid out at the size the standard says: ID-1 for cards, ID-3 for a passport page. Printed at 100%, it measures correctly.\n\n" +
          "Automatic detection is not always right, and this does not pretend otherwise — the four corners are draggable, and when nothing is found confidently the tool says so instead of cropping to a guess. Everything runs in your browser, which matters more here than for most tools: the document is usually an identity document."
        }
        steps={STEPS.map(([title, desc]) => ({ title, desc }))}
        faqs={FAQS}
      >
        <DocScanLoader />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Related tools">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Next steps</h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              { href: "/pdf-tools/merge", label: "Merge the scans into one PDF" },
              { href: "/pdf-tools/compress", label: "Compress the PDF for email" },
              { href: "/pdf-tools/ocr", label: "Make the text searchable (OCR)" },
              { href: "/remove-background/id-photo", label: "Clean up an ID photo background" },
              { href: "/passport-photo", label: "Passport photo sizes by country" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

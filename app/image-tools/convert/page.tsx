import Link from "next/link";
import ToolPageShell from "@/components/ToolPageShell";
import ImageEditClient from "@/components/ImageEditClient";
import { pageMeta } from "@/lib/seo";
import { CONVERT_PAIRS, pairGrad } from "@/lib/convert-pairs";


export const metadata = pageMeta({ title: "Convert Image — Free Online Tool", description: "Convert images between JPG, PNG and WebP formats in one click.", path: "/image-tools/convert" });
export default function ConvertImagePage() {
  return (
    <>
      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title="Convert Image" emoji="🔄"
        grad="linear-gradient(135deg,#db2777,#f472b6)"
        intro="Convert images between JPG, PNG and WebP formats in one click."
        about="Different formats serve different needs: JPG is best for photos (small size), PNG keeps transparency and sharp edges, and WebP gives the best compression for the web. This converter changes the format while preserving quality, entirely in your browser. Convert a PNG screenshot to JPG to email it, or to WebP to speed up your website."
        steps={[
          { title: "Upload an image", desc: "Choose any JPG, PNG or WebP file." },
          { title: "Choose target format", desc: "Select JPG, PNG or WebP as the output." },
          { title: "Convert & download", desc: "Click Convert and save the new file." },
        ]}
      >
        <ImageEditClient mode="convert" />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Convert by exact format pair">
          <h2 className="qx-title mb-1" style={{ color: "var(--text)" }}>By exact conversion</h2>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
            Same tool, pre-set for a specific format pair — with the caveats each one has (transparency, compression, compatibility).
          </p>
          <div className="flex flex-wrap gap-2.5">
            {CONVERT_PAIRS.map((p) => (
              <Link key={p.slug} href={`/convert/${p.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: pairGrad(p), display: "inline-block" }} />
                {p.emoji} {p.from} → {p.to}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

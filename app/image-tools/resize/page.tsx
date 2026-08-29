import Link from "next/link";
import ToolPageShell from "@/components/ToolPageShell";
import ImageEditClient from "@/components/ImageEditClient";
import { pageMeta } from "@/lib/seo";
import { RESIZE_PRESETS, type ResizePreset } from "@/lib/resize-presets";

const GROUP_ORDER: ResizePreset["group"][] = ["Display", "Web", "ID", "Print"];

export const metadata = pageMeta({ title: "Resize Image — Free Online Tool", description: "Change the dimensions of your image to exact pixel sizes, with optional aspect-ratio lock.", path: "/image-tools/resize" });
export default function ResizeImagePage() {
  return (
    <>
      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title="Resize Image" emoji="📐"
        grad="linear-gradient(135deg,#2563eb,#60a5fa)"
        intro="Change the dimensions of your image to exact pixel sizes, with optional aspect-ratio lock."
        about="Resizing is useful for fitting images into specific places: social media posts, thumbnails, avatars or print layouts. Keep 'Lock aspect ratio' on to avoid stretching — changing width updates height automatically. You can also choose the output format. All processing happens in your browser; your image never leaves your device."
        steps={[
          { title: "Upload an image", desc: "Choose the image you want to resize." },
          { title: "Enter dimensions", desc: "Type a new width or height; ratio stays locked by default." },
          { title: "Resize & download", desc: "Pick a format and download the resized image." },
        ]}
      >
        <ImageEditClient mode="resize" />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Resize to an exact preset size">
          <h2 className="qx-title mb-1" style={{ color: "var(--text)" }}>By exact size</h2>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
            Same tool, pre-set to a specific pixel size — screens, web, ID photos and print.
          </p>
          {GROUP_ORDER.map((group) => {
            const presets = RESIZE_PRESETS.filter((p) => p.group === group);
            if (!presets.length) return null;
            return (
              <div key={group} className="mb-4 last:mb-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>{group}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {presets.map((p) => (
                    <Link key={p.slug} href={`/resize/${p.slug}`}
                      className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                      {p.emoji} {p.label} · {p.w}×{p.h}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}

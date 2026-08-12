import Link from "next/link";
import ToolPageShell from "@/components/ToolPageShell";
import RemoveBgClient from "@/components/RemoveBgClient";
import { pageMeta } from "@/lib/seo";
import { BG_USE_CASES } from "@/lib/removebg-usecases";

/* Short chip labels — h1 wording varies per page ("Remove the background from
   a signature" vs "Make an image background transparent" vs "Put a photo on a
   white background"), so a regex guess is not reliable for UI text. Named
   explicitly instead. */
const USE_CASE_LABEL: Record<string, string> = {
  signature: "Signature", logo: "Logo", "product-photo": "Product Photo",
  "profile-picture": "Profile Picture", "transparent-png": "Transparent PNG",
  "white-background": "White Background", hair: "Hair", "id-photo": "ID Photo",
  sticker: "Sticker", furniture: "Furniture", car: "Car",
};

/* /image-tools/remove-bg carries 65-73% of the site's GSC impressions
   (SEO_STRATEGY.md baseline) — the highest-authority page on the site by
   search visibility. It had ZERO links to /remove-background, the eleven
   intent-exact pages built for this exact traffic (M150, lib/removebg-
   usecases.ts) — that family was reachable only through /image-tools and its
   own hub, never from the page that actually earns the impressions. Linking
   it here sends internal authority to the pages built to win the long tail,
   and gives a visitor whose specific need (logo, signature, ID photo…) isn't
   named on this generic page somewhere to go. */
export const metadata = pageMeta({ title: "Background Remover — Free Online Tool", description: "Remove the background from any image automatically with AI — right in your browser.", path: "/image-tools/remove-bg" });
export default function RemoveBgPage() {
  return (
    <>
      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title="Background Remover" emoji="✂️"
        grad="linear-gradient(135deg,#7c3aed,#a855f7)"
        intro="Remove the background from any image automatically with AI — right in your browser."
        about="This tool uses an AI segmentation model that runs entirely in your browser. Your image is never uploaded to any server, so it stays completely private. The result is a transparent PNG you can use for product photos, profile pictures, logos, stickers and presentations. The first run downloads the AI model once (a few MB); after that it works instantly even offline."
        steps={[
          { title: "Upload an image", desc: "Choose a JPG, PNG or WebP file with a clear subject." },
          { title: "Remove background", desc: "Click the button — the AI detects the subject and cuts the background." },
          { title: "Download PNG", desc: "Save the transparent result and use it anywhere." },
        ]}
      >
        <RemoveBgClient />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Remove background by what you're cutting out">
          <h2 className="qx-title mb-1" style={{ color: "var(--text)" }}>By what you&rsquo;re cutting out</h2>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
            Same tool, with guidance specific to your subject and its common pitfalls.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {BG_USE_CASES.map((u) => (
              <Link key={u.slug} href={`/remove-background/${u.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {u.emoji} {USE_CASE_LABEL[u.slug] ?? u.slug}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

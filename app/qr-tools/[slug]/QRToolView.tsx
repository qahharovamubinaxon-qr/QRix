/* A SERVER component (it was QRToolClient, and "use client" bought nothing —
   there is no state or hook here, only a registry lookup). Being a client
   component made it the root of the client tree for all 40 QR tool routes, so
   ToolPageShell and every icon in it hydrated with the page. The one thing
   that genuinely needs the client is the generator, and it takes an id now
   because QR_TYPES entries hold functions. */

import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import QRGeneratorByType from "@/components/QRGeneratorByType";
import { getQrTool } from "@/lib/qr-tools-meta";
import { QR_TYPES } from "@/lib/qr-types";

export default function QRToolView({ slug }: { slug: string }) {
  const meta = getQrTool(slug);
  if (!meta || !QR_TYPES[meta.typeId]) return notFound();

  return (
    <ToolPageShell
      category="QR Tools"
      categoryHref="/qr-tools"
      title={meta.title}
      emoji={meta.emoji}
      grad={meta.grad}
      intro={meta.desc}
      about={meta.about}
      steps={meta.steps}
      faqs={meta.faqs}
      useCases={meta.useCases}
    >
      <QRGeneratorByType typeId={meta.typeId} />
    </ToolPageShell>
  );
}

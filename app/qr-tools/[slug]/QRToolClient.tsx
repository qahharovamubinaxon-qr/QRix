"use client";

import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import QRGenerator from "@/components/QRGenerator";
import { getQrTool } from "@/lib/qr-tools-meta";
import { QR_TYPES } from "@/lib/qr-types";

export default function QRToolClient({ slug }: { slug: string }) {
  const meta = getQrTool(slug);
  const type = meta ? QR_TYPES[meta.typeId] : undefined;
  if (!meta || !type) return notFound();

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
    >
      <QRGenerator type={type} />
    </ToolPageShell>
  );
}

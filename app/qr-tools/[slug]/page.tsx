import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRToolClient from "./QRToolClient";
import { getQrTool, QR_TOOLS } from "@/lib/qr-tools-meta";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

export function generateStaticParams() {
  return QR_TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = getQrTool(slug);
  if (!meta) return {};
  return pageMeta({
    title: `${meta.title} — Free Online Generator`,
    description: meta.info || meta.desc,
    path: `/qr-tools/${slug}`,
    keywords: [meta.title, `${meta.title} generator`, "free QR code", "QR code with logo"],
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getQrTool(slug);
  if (!meta) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(meta.title, meta.about, `/qr-tools/${slug}`),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "QR Tools", path: "/qr-tools" },
            { name: meta.title, path: `/qr-tools/${slug}` },
          ]),
          ...(meta.faqs && meta.faqs.length ? [faqLd(meta.faqs)] : []),
        ])}
      />
      <QRToolClient slug={slug} />
    </>
  );
}

import { notFound } from "next/navigation";
import LocalizedBarcodePage from "@/components/LocalizedBarcodePage";
import { pageMeta } from "@/lib/seo";
import { getBarcodeType } from "@/lib/barcode-types";
import { locBarcode, LOC_BARCODE_TYPES } from "@/lib/barcode-types-i18n";

export function generateStaticParams() {
  return LOC_BARCODE_TYPES.map((t) => ({ type: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = getBarcodeType(type);
  if (!t) return {};
  const c = locBarcode(t, "uz");
  return pageMeta({
    title: c.title, description: c.desc, path: `/uz/barcode/${t.slug}`, keywords: c.keywords,
    languages: { en: `/barcode/${t.slug}`, ru: `/ru/barcode/${t.slug}`, uz: `/uz/barcode/${t.slug}`, "x-default": `/barcode/${t.slug}` },
  });
}

export default async function Page({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = getBarcodeType(type);
  if (!t) notFound();
  return <LocalizedBarcodePage type={t} lang="uz" />;
}

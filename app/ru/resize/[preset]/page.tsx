import { notFound } from "next/navigation";
import LocalizedResizePage from "@/components/LocalizedResizePage";
import { pageMeta } from "@/lib/seo";
import { getPreset } from "@/lib/resize-presets";
import { locResize, LOC_RESIZE_PRESETS } from "@/lib/resize-presets-i18n";

export function generateStaticParams() {
  return LOC_RESIZE_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ preset: string }> }) {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) return {};
  const c = locResize(p, "ru");
  return pageMeta({
    title: c.title, description: c.desc, path: `/ru/resize/${p.slug}`, keywords: c.keywords,
    languages: { en: `/resize/${p.slug}`, ru: `/ru/resize/${p.slug}`, uz: `/uz/resize/${p.slug}`, "x-default": `/resize/${p.slug}` },
  });
}

export default async function Page({ params }: { params: Promise<{ preset: string }> }) {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) notFound();
  return <LocalizedResizePage preset={p} lang="ru" />;
}

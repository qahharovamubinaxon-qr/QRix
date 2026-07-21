import { notFound } from "next/navigation";
import LocalizedConvertPage from "@/components/LocalizedConvertPage";
import { pageMeta } from "@/lib/seo";
import { getPair, CONVERT_PAIRS } from "@/lib/convert-pairs";
import { locConvert } from "@/lib/convert-pairs-i18n";

export function generateStaticParams() {
  return CONVERT_PAIRS.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) return {};
  const c = locConvert(p, "ru");
  return pageMeta({
    title: c.title, description: c.desc, path: `/ru/convert/${p.slug}`, keywords: c.keywords,
    languages: { en: `/convert/${p.slug}`, ru: `/ru/convert/${p.slug}`, uz: `/uz/convert/${p.slug}`, "x-default": `/convert/${p.slug}` },
  });
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) notFound();
  return <LocalizedConvertPage pair={p} lang="ru" />;
}

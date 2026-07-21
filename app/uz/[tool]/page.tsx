import { notFound } from "next/navigation";
import LocalizedToolPage from "@/components/LocalizedToolPage";
import { pageMeta } from "@/lib/seo";
import { LOC_TOOLS, getLocTool } from "@/lib/localized-tools";

export function generateStaticParams() {
  return LOC_TOOLS.map((t) => ({ tool: t.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const t = getLocTool(tool);
  if (!t) return {};
  return pageMeta({
    title: t.uz.title, description: t.uz.desc, path: `/uz/${tool}`, keywords: t.uz.keywords,
    languages: { en: t.enPath, ru: `/ru/${tool}`, uz: `/uz/${tool}`, "x-default": t.enPath },
  });
}

export default async function Page({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const t = getLocTool(tool);
  if (!t) notFound();
  return <LocalizedToolPage tool={t} lang="uz" others={LOC_TOOLS.filter((x) => x.slug !== tool)} />;
}

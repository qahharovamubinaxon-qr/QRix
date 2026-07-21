import LocalizedHub from "@/components/LocalizedHub";
import { pageMeta } from "@/lib/seo";
import { CONVERT_HUB } from "@/lib/hub-i18n";

const c = CONVERT_HUB.uz;

export const metadata = pageMeta({
  title: c.title, description: c.desc, path: "/uz/convert", keywords: c.keywords,
  languages: { en: "/convert", ru: "/ru/convert", uz: "/uz/convert", "x-default": "/convert" },
});

export default function Page() {
  return <LocalizedHub kind="convert" lang="uz" />;
}

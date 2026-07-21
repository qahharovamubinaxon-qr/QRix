import LocalizedHub from "@/components/LocalizedHub";
import { pageMeta } from "@/lib/seo";
import { RESIZE_HUB } from "@/lib/hub-i18n";

const c = RESIZE_HUB.ru;

export const metadata = pageMeta({
  title: c.title, description: c.desc, path: "/ru/resize", keywords: c.keywords,
  languages: { en: "/resize", ru: "/ru/resize", uz: "/uz/resize", "x-default": "/resize" },
});

export default function Page() {
  return <LocalizedHub kind="resize" lang="ru" />;
}

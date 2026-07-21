import LocalizedHub from "@/components/LocalizedHub";
import { pageMeta } from "@/lib/seo";
import { BARCODE_HUB } from "@/lib/hub-i18n";

const c = BARCODE_HUB.uz;

export const metadata = pageMeta({
  title: c.title, description: c.desc, path: "/uz/barcode", keywords: c.keywords,
  languages: { en: "/barcode", ru: "/ru/barcode", uz: "/uz/barcode", "x-default": "/barcode" },
});

export default function Page() {
  return <LocalizedHub kind="barcode" lang="uz" />;
}

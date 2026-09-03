/* Transforms .seo-crawl.json (produced by `npm run aeo:audit -- --json`) into
   docs/seo-url-inventory.json — one record per public URL with its page type and
   any problems, plus a printed summary. Real crawl data only; nothing invented. */
import { readFileSync, writeFileSync } from "node:fs";
const ORIGIN = "https://qrixtools.com";
const d = JSON.parse(readFileSync(".seo-crawl.json", "utf8"));

function typeOf(u) {
  const p = u.replace(ORIGIN, "").replace(/\/$/, "") || "/";
  if (p === "/") return "homepage";
  const seg = p.split("/").filter(Boolean);
  const loc = seg[0] === "ru" || seg[0] === "uz";
  const s = loc ? seg.slice(1) : seg;
  const fam = s[0] || "";
  if (["qr-tools","pdf-tools","image-tools","ai-tools","video-tools","3d-tools"].includes(fam))
    return s.length === 1 ? "category" : `${fam.replace("-tools","")}-tool`;
  if (fam === "downloader") return "downloader";
  if (fam === "blog") return s.length > 1 ? "blog-article" : "blog-index";
  if (fam === "use" || fam === "use-cases") return "use-case";
  if (fam === "compare") return "comparison";
  if (["docs","help","guide","guides"].includes(fam)) return "documentation";
  if (["contact","terms","privacy","about","pricing"].includes(fam)) return "info";
  return loc ? `localized-${fam || "root"}` : (fam || "other");
}

const problems = (p) => {
  const out = [];
  if (p.status !== 200) out.push(`http-${p.status}`);
  if (!p.title) out.push("no-title");
  if (p.h1 === 0) out.push("no-h1");
  if (p.h1 > 1) out.push("multiple-h1");
  if (!p.desc) out.push("no-description");
  if (!p.canonical) out.push("no-canonical");
  if (p.canonical && !p.canonical.startsWith(ORIGIN)) out.push("offsite-canonical");
  if (/noindex/i.test(p.robotsMeta || "")) out.push("noindex");
  if (!p.breadcrumb) out.push("no-breadcrumb");
  if (p.badJsonLd) out.push("bad-jsonld");
  if ((p.dupSchema || []).length) out.push("dup-schema");
  if (p.words < 120) out.push("thin-prose");
  return out;
};

const orphans = new Set(d.orphans || []);
const records = d.pages.map((p) => ({
  url: p.url,
  route: p.url.replace(ORIGIN, "") || "/",
  pageType: typeOf(p.url),
  status: p.status,
  indexable: p.status === 200 && !/noindex/i.test(p.robotsMeta || ""),
  title: p.title || null,
  h1: p.h1Text || null,
  h1Count: p.h1,
  description: p.desc || null,
  canonical: p.canonical || null,
  robots: p.robotsMeta || null,
  schema: p.types || [],
  breadcrumb: !!p.breadcrumb,
  words: p.words,
  internalLinks: p.internalLinks,
  inSitemap: true,
  orphan: orphans.has(p.url.replace(ORIGIN, "")) || orphans.has(p.url),
  problems: problems(p),
}));

const byType = {};
for (const r of records) byType[r.pageType] = (byType[r.pageType] || 0) + 1;
const withProblems = records.filter((r) => r.problems.length);

writeFileSync("docs/seo-url-inventory.json", JSON.stringify({
  generated: new Date().toISOString(),
  origin: ORIGIN,
  totalUrls: records.length,
  indexable: records.filter((r) => r.indexable).length,
  byType,
  urlsWithProblems: withProblems.length,
  pages: records,
}, null, 2));

console.log("wrote docs/seo-url-inventory.json —", records.length, "URLs");
console.log("by type:", JSON.stringify(byType, null, 0));
console.log("urls with any problem (mostly deliberate P2):", withProblems.length);

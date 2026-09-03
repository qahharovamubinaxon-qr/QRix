/* Builds docs/search-intent-map.json from the tool registries — the natural-
   language questions and keyword targets are REAL product data (each tool's own
   faqs[].q and keywords[]), not invented queries. One record per live tool maps
   its primary intent, secondary intents and the questions it already answers on
   the page, so nothing here claims a page that does not exist. */
import { writeFileSync } from "node:fs";
import { QR_TOOLS } from "../lib/qr-tools-meta.ts";
import { IMAGE_TOOLS } from "../lib/image-tools-meta.ts";
import { AI_TOOLS } from "../lib/ai-tools-meta.ts";
import { VIDEO_TOOLS } from "../lib/video-tools-meta.ts";
import { THREE_TOOLS } from "../lib/three-tools-meta.ts";

const FAMILIES = [
  ["qr", "/qr-tools", QR_TOOLS],
  ["image", "/image-tools", IMAGE_TOOLS],
  ["ai", "/ai-tools", AI_TOOLS],
  ["video", "/video-tools", VIDEO_TOOLS],
  ["3d", "/3d-tools", THREE_TOOLS],
];

const records = [];
for (const [family, base, tools] of FAMILIES) {
  for (const t of tools) {
    if (t.status && t.status !== "live") continue;
    const questions = (t.faqs || []).map((f) => f.q);
    const kw = t.keywords || [];
    records.push({
      family,
      url: `${base}/${t.slug}`,
      title: t.title,
      // primary intent = the tool's own first keyword phrase, its declared focus
      primaryIntent: kw[0] || t.title.toLowerCase(),
      secondaryIntents: kw.slice(1, 6),
      questionsAnswered: questions,   // real: rendered as FAQPage on the page
      answerSurface: t.intro ? t.intro.slice(0, 200) : null,
    });
  }
}

writeFileSync("docs/search-intent-map.json", JSON.stringify({
  generated: new Date().toISOString(),
  note: "primaryIntent/secondaryIntents are each tool's registry keywords; questionsAnswered are the FAQ questions actually rendered on the page (schema FAQPage). No query here is invented and none maps to a page that does not exist.",
  tools: records,
}, null, 2));

console.log("wrote docs/search-intent-map.json —", records.length, "live tools");
const q = records.reduce((n, r) => n + r.questionsAnswered.length, 0);
const k = records.reduce((n, r) => n + r.secondaryIntents.length + 1, 0);
console.log("real FAQ questions mapped:", q, "| keyword intents mapped:", k);

/* Does the Related tools block actually carry six-plus links on every family?
 *
 * scripts/test-related.mjs asserts SOURCE properties, which is all a test can
 * do without a bundler — and it is not enough here, because the thing that
 * decides the link count is the SIZE OF EACH FAMILY IN THE REGISTRY, not the
 * code. THREE_TOOLS holds exactly one tool, so /3d-tools pages had a sibling
 * pool of zero and rendered no block at all; nothing in the source said so and
 * the page looked deliberate. Only the built page answers this.
 *
 * Two pages per family, because the second one is the real question: the block
 * is rotated per page so the family's links spread over all its members, and a
 * rotation that has silently degenerated to a constant looks perfect on any
 * single page.
 *
 *   npm run probe:related            (production)
 *   npm run probe:related -- <base>
 */

const BASE = (process.argv[2] || "https://qrixtools.com").replace(/\/+$/, "");

/* Two live URLs per family the tool template covers. */
const FAMILIES = {
  "/qr-tools": ["/qr-tools/url", "/qr-tools/wifi"],
  "/pdf-tools": ["/pdf-tools/merge", "/pdf-tools/split"],
  "/image-tools": ["/image-tools/compress", "/image-tools/upscale"],
  "/ai-tools": ["/ai-tools/image-upscaler", "/ai-tools/background-remover"],
  "/video-tools": ["/video-tools/compress-video", "/video-tools/video-converter"],
  "/3d-tools": ["/3d-tools/image-to-3d"],
};

const MIN = 6;

/* The block, then the anchors inside it. Anchored on the heading and closed at
   the next </section>, so links from the FAQ or the closing CTA below it are
   not counted as related tools — a count that quietly includes the rest of the
   page would report a broken block as healthy. */
function relatedLinks(html) {
  const start = html.search(/<section[^>]*aria-label="Tools related to/i);
  if (start === -1) return null;
  const end = html.indexOf("</section>", start);
  const block = html.slice(start, end === -1 ? undefined : end);
  const hrefs = [...block.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"/gi)].map((m) => m[1]);
  return [...new Set(hrefs)];
}

let failed = 0;
const fail = (m) => { failed++; console.log(`  FAIL  ${m}`); };
const ok = (m) => console.log(`  ok    ${m}`);

console.log(`Related-tools probe against ${BASE}\n`);

for (const [family, urls] of Object.entries(FAMILIES)) {
  const sets = [];
  for (const u of urls) {
    let html, status;
    try {
      const r = await fetch(BASE + u, { headers: { "user-agent": "Mozilla/5.0 QRixRelatedProbe" } });
      status = r.status;
      html = await r.text();
    } catch (e) {
      fail(`${u} — fetch failed: ${e.message}`);
      continue;
    }
    if (status !== 200) { fail(`${u} — HTTP ${status}`); continue; }

    const links = relatedLinks(html);
    if (links === null) { fail(`${u} — no Related tools block in the server HTML`); continue; }
    if (links.length < MIN) {
      fail(`${u} — ${links.length} related links, want >= ${MIN}${links.length ? ` (${links.join(" ")})` : ""}`);
      continue;
    }
    if (links.includes(u)) fail(`${u} — links to ITSELF`);
    else ok(`${u} — ${links.length} related links`);
    sets.push({ u, links });
  }

  /* The rotation. Two pages in one family sharing an identical link set means
     every page in that family points at the same targets and the rest of the
     family is as orphaned as before the block existed. */
  if (sets.length === 2) {
    const [a, b] = sets;
    if (a.links.join(",") === b.links.join(",")) {
      fail(`${family} — both pages carry an IDENTICAL link set; the rotation is not rotating`);
    } else {
      const shared = a.links.filter((h) => b.links.includes(h)).length;
      ok(`${family} — the two pages differ (${shared}/${a.links.length} shared)`);
    }
  }
}


/* ---- blog articles ------------------------------------------------------
   Different bug, same failure mode, so it is checked the same way. The article
   template resolved its "Keep reading" links out of the STATIC registry while
   autopilot posts live in Supabase and name each other -- so every lookup
   missed, the list came back empty, and the section did not render at all. A
   post with no related reading and a post whose related reading silently failed
   to resolve look IDENTICAL from the outside. That is why this has to be live. */

const BLOG = ["/blog/merge-pdf-files-free", "/blog/compress-pdf-without-losing-quality", "/blog/qr-code-analytics-tracking"];
const blogSets = [];
for (const u of BLOG) {
  let html, status;
  try {
    const r = await fetch(BASE + u, { headers: { "user-agent": "Mozilla/5.0 QRixRelatedProbe" } });
    status = r.status; html = await r.text();
  } catch (e) { fail(u + " -- fetch failed: " + e.message); continue; }
  if (status !== 200) { fail(u + " -- HTTP " + status); continue; }
  const links = [...new Set([...html.matchAll(/<a\b[^>]*\shref="(\/blog\/[^"#?]+)"/gi)].map((m) => m[1]))]
    .filter((h) => h.replace(/\/+$/, "") !== u);
  if (links.length < MIN) fail(u + " -- " + links.length + " links to other posts, want >= " + MIN);
  else ok(u + " -- " + links.length + " links to other posts");
  blogSets.push({ u, links });
}
if (blogSets.length >= 2) {
  const [a, b] = blogSets;
  if (a.links.join(",") === b.links.join(",")) fail("/blog -- two articles carry an IDENTICAL set; the rotation is not rotating");
  else ok("/blog -- articles differ (" + a.links.filter((h) => b.links.includes(h)).length + "/" + a.links.length + " shared)");
}

console.log(failed ? `\n${failed} FAILED` : `\nrelated probe: ok`);
process.exit(failed ? 1 : 0);

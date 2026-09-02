/* Which localised pages exist without telling Google they are localised?
   ───────────────────────────────────────────────────────────────────────────
   The site has Russian and Uzbek twins for a growing set of pages, and its
   audience is Russia, Uzbekistan and Kazakhstan — but Search Console shows the
   impressions going to the Philippines, India and Indonesia at position ~85.
   One ordinary cause of that is missing hreflang: without it Google has no way
   to know /passport-photo and /ru/passport-photo are the same page in two
   languages, so it picks one and serves it to everybody.

   This reads the live sitemap, finds every /ru/ and /uz/ URL, derives the
   English original, and checks whether that original declares hreflang. It
   reports only pages where the twin genuinely answers 200 — a missing tag
   matters solely when there is something to point at.

     npm run probe:hreflang

   Exit code is the number of pages with a live twin and no hreflang. */

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const UA = "QRixHreflangProbe/1.0 (+https://qrixtools.com)";

const get = async (url) => {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25_000), redirect: "manual" });
    const body = r.status >= 300 && r.status < 400 ? "" : await r.text();
    return { status: r.status, body };
  } catch (e) {
    return { status: 0, body: "", err: e.message };
  }
};

const sitemap = await get(`${ORIGIN}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.log(`sitemap returned ${sitemap.status} — nothing can be checked`);
  process.exit(1);
}

const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const localised = urls.filter((u) => /\/(ru|uz)\//.test(u));

/* Finding the English original by stripping the /ru/ prefix is WRONG, and it
   was wrong in a way that manufactured nine fake problems on the first run:
   /ru/split's English twin lives at /pdf-tools/split, not /split. The URL
   shapes differ between languages by design.

   So ask the page itself. Each localised page already declares
   hrefLang="en" pointing at its original; that is the authoritative link and
   the one Google reads. Pages that declare nothing are the real finding. */
const originals = new Map(); // englishURL -> Set(langs)
const silent = [];           // localised pages that declare no English twin

for (const u of localised) {
  const page = await get(u);
  if (page.status !== 200) continue;
  const lang = (u.match(/\/(ru|uz)\//) || [])[1];
  const enHref = (page.body.match(/hreflang\s*=\s*"en"\s+href\s*=\s*"([^"]+)"/i)
    || page.body.match(/href\s*=\s*"([^"]+)"\s+hreflang\s*=\s*"en"/i) || [])[1];
  if (!enHref) { silent.push(u.replace(ORIGIN, "")); continue; }
  if (!originals.has(enHref)) originals.set(enHref, new Set());
  originals.get(enHref).add(lang);
}

if (silent.length) {
  console.log(`${silent.length} localised page(s) declare no English twin at all:`);
  for (const s of silent.slice(0, 12)) console.log(`   ${s}`);
  console.log();
}

console.log(`sitemap: ${urls.length} URLs · ${localised.length} localised · ${originals.size} English originals to check\n`);

const missing = [];
let checked = 0, ok = 0, noOriginal = 0;

for (const [en, langs] of originals) {
  const page = await get(en.startsWith("http") ? en : ORIGIN + en);
  checked++;
  /* If the English page does not exist, the localised one is not a translation
     of anything and hreflang is not the issue — report it separately rather
     than counting it as a failure of the same kind. */
  if (page.status !== 200) { noOriginal++; continue; }
  // Next renders the attribute as hrefLang in some paths; match case-insensitively.
  const has = /hreflang\s*=/i.test(page.body);
  if (has) { ok++; continue; }
  missing.push({ en, langs: [...langs].join("+") });
}

console.log(`checked ${checked} · ${ok} declare hreflang · ${missing.length} do NOT · ${noOriginal} have no English original\n`);

if (missing.length) {
  console.log("Live twin, but the English page says nothing about it:");
  for (const m of missing) console.log(`   ${m.en.replace(ORIGIN, "").padEnd(42)} twin: ${m.langs}`);
  console.log(`\nEach of these is a page Google cannot match to its Russian version.`);
}

process.exit(missing.length);

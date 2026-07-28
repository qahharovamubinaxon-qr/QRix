/* The operator identity is an E-E-A-T signal, which means it is only worth
 * anything if it is TRUE — and the ways it can go wrong are all silent.
 *
 * lib/operator.ts holds four fields the owner must supply personally (legal
 * name, photo, social profiles, domain email) and they are `null` until then.
 * Null is the safe state: every consumer omits the property. The failure modes
 * this guard exists to catch are the ones that look fine on the page:
 *
 *   · a null field rendering as the literal "null"/"undefined" in JSON-LD, or
 *     as an empty byline — schema that says name: null is worse than no schema
 *   · a placeholder ("TODO", "example.com", "Your Name") reaching production as
 *     if it were a real identity, which is the fabrication rule (M143) failing
 *     in the one place it matters most
 *   · the visible byline and the schema author drifting apart — a page whose
 *     markup contradicts its own text is a NEGATIVE trust signal
 *   · the @id graph breaking, so every article credits an unrelated anonymous
 *     Person instead of resolving to the one human on /about
 *   · the Organization logo drifting back to /icon, which 404s (the exact
 *     defect M142 fixed; a schema logo pointing at a 404 is invalid)
 *
 * Static invariants always run. Pass a base URL to also assert the RENDERED
 * pages carry the byline and the graph — a unit test cannot see whether the
 * markup actually reached the HTML:
 *
 *   node scripts/test-eeat.mjs                          (static only)
 *   node scripts/test-eeat.mjs https://qrixtools.com    (+ live assertions)
 */

/* lib/operator.ts imports "@/lib/seo" the way the app does, which node cannot
   resolve on its own — scripts/resolve-ts-alias.mjs teaches it the alias and is
   loaded via --import in the npm script (a plain import here would be hoisted
   and register too late). Run this file through `npm run test:eeat`. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OPERATOR,
  BYLINE,
  personLd,
  organizationLd,
  articleAuthorLd,
  articlePublisherLd,
  operatorSameAs,
  organizationSameAs,
} from "../lib/operator.ts";
import { formatPostDate, allPostsSorted } from "../lib/blog.ts";

const BASE = process.argv[2]?.replace(/\/$/, "") || "";

let pass = 0;
let failed = 0;
const ok = (label, fn) => {
  try {
    fn();
    pass++;
  } catch (err) {
    console.error(`\n  FAIL  ${label}\n        ${err.message}\n`);
    failed++;
    process.exitCode = 1;
  }
};
const okAsync = async (label, fn) => {
  try {
    await fn();
    pass++;
  } catch (err) {
    console.error(`\n  FAIL  ${label}\n        ${err.message}\n`);
    failed++;
    process.exitCode = 1;
  }
};

/* ---------------------------------------------------------------- no nulls -- */

const walk = (node, path, hit) => {
  if (node === null || node === undefined) return hit.push(path);
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, hit));
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, hit);
    return;
  }
  if (typeof node === "string" && /^(null|undefined|NaN|)$/.test(node.trim())) hit.push(path);
};

const GRAPH = { personLd: personLd(), organizationLd: organizationLd(), articleAuthorLd: articleAuthorLd(), articlePublisherLd: articlePublisherLd() };

for (const [name, node] of Object.entries(GRAPH)) {
  ok(`${name}() emits no null/undefined/empty values`, () => {
    const hit = [];
    walk(node, name, hit);
    assert.deepEqual(hit, [], `these keys carry a null-ish value: ${hit.join(", ")}`);
  });
}

/* ------------------------------------------------------------ placeholders -- */

const PLACEHOLDER = /(TODO|FIXME|XXX|example\.(com|org)|your[-_ ]?name|lorem|placeholder|changeme|John Doe|\bTBD\b)/i;

ok("no placeholder text anywhere in the identity graph", () => {
  const blob = JSON.stringify(GRAPH) + JSON.stringify(OPERATOR) + BYLINE;
  const m = blob.match(PLACEHOLDER);
  assert.equal(m, null, `placeholder identity reached the graph: ${m?.[0]}`);
});

ok("every sameAs entry is an absolute http(s) URL", () => {
  for (const u of [...operatorSameAs(), ...organizationSameAs()]) {
    assert.match(u, /^https?:\/\/[^\s"']+$/, `not a usable URL: ${u}`);
  }
});

ok("optional owner fields are either null or non-empty (never blank strings)", () => {
  for (const k of ["fullName", "imageUrl", "github", "linkedin", "x"]) {
    const v = OPERATOR[k];
    assert.ok(v === null || (typeof v === "string" && v.trim().length > 0), `OPERATOR.${k} is a blank string — use null instead`);
  }
});

/* ------------------------------------------------------------- @id linkage -- */

ok("Person and Organization cross-reference each other by @id", () => {
  const person = personLd();
  const org = organizationLd();
  assert.equal(org.founder["@id"], person["@id"], "Organization.founder does not point at the Person");
  assert.equal(person.worksFor["@id"], org["@id"], "Person.worksFor does not point at the Organization");
});

ok("article author/publisher resolve to those same two @ids", () => {
  assert.equal(articleAuthorLd()["@id"], personLd()["@id"], "article author is a different entity from the /about Person");
  assert.equal(articlePublisherLd()["@id"], organizationLd()["@id"], "article publisher is a different entity from the site Organization");
});

ok("the article author is a Person, not an Organization", () => {
  // A named human outranks a brand as an E-E-A-T signal; this was an
  // Organization before M145 and the regression would be invisible.
  assert.equal(articleAuthorLd()["@type"], "Person");
});

/* ---------------------------------------------------- byline agrees w/ LD -- */

ok("visible byline and schema author name are the same string", () => {
  assert.ok(BYLINE.startsWith(personLd().name), `byline "${BYLINE}" does not start with schema author "${personLd().name}"`);
  assert.equal(articleAuthorLd().name, personLd().name, "article author name differs from the Person name");
});

/* ----------------------------------------------------------------- logo -- */

ok("Organization logo is /icon.png — /icon and /apple-icon 404", () => {
  const url = organizationLd().logo.url;
  assert.match(url, /\/icon\.png$/, `logo must be /icon.png, got ${url}`);
});

/* --------------------------------------------------------- date hardening -- */

ok("formatPostDate rejects unparseable and missing dates", () => {
  assert.equal(formatPostDate(undefined), null);
  assert.equal(formatPostDate(""), null);
  assert.equal(formatPostDate("not-a-date"), null);
  const good = formatPostDate("2026-07-28T00:00:00.000Z");
  assert.ok(good && /2026/.test(good.label), "a valid ISO date must format");
  assert.equal(good.iso, "2026-07-28T00:00:00.000Z", "iso must round-trip for the <time datetime> attribute");
});

ok("every hand-written post has a parseable date", () => {
  const bad = allPostsSorted().filter((p) => formatPostDate(p.date) === null).map((p) => p.slug);
  assert.deepEqual(bad, [], `posts with an unusable date: ${bad.join(", ")}`);
});

/* ------------------------------------------------------- consumers wired -- */

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

ok("/about renders the operator name and the Person schema", () => {
  const s = src("app/about/page.tsx");
  assert.match(s, /personLd\(\)/, "/about must emit the Person node");
  assert.match(s, /OPERATOR\.name|OPERATOR\.fullName/, "/about must render the operator name from lib/operator");
  assert.match(s, /AboutPage/, "/about should declare itself an AboutPage");
});

ok("the article template emits author, publisher and image", () => {
  const s = src("app/blog/[slug]/page.tsx");
  assert.match(s, /articleAuthorLd\(\)/, "Article.author must come from lib/operator");
  assert.match(s, /articlePublisherLd\(\)/, "Article.publisher must come from lib/operator");
  assert.match(s, /image:\s*\{/, "Article.image was the missing required property — do not drop it again");
  assert.match(s, /rel="author"/, "the visible byline must link to /about with rel=author");
});

ok("the root layout emits the shared Organization node", () => {
  const s = src("app/layout.tsx");
  assert.match(s, /organizationLd\(\)/, "layout must use the shared Organization node, not an inline stub");
  assert.doesNotMatch(s, /"@type":\s*"Organization"/, "an inline Organization stub is back — it will drift from lib/operator");
});

/* ------------------------------------------------------------------ live -- */

if (BASE) {
  const get = async (path) => {
    const res = await fetch(`${BASE}${path}`, { headers: { "user-agent": "qrix-eeat-guard" } });
    return { status: res.status, html: await res.text() };
  };
  const ldBlocks = (html) =>
    [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap(([, body]) => {
        try {
          const parsed = JSON.parse(body);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [{ __unparseable: body.slice(0, 120) }];
        }
      });

  await okAsync("live /about is 200 and answers who built it", async () => {
    const { status, html } = await get("/about");
    assert.equal(status, 200);
    assert.ok(html.includes(OPERATOR.name), "the operator name is not in the rendered /about");
    assert.match(html, /pdf-to-word/, "/about must name the tool that actually uploads");
  });

  await okAsync("live /about carries a valid Person node linked to the Organization", async () => {
    const { html } = await get("/about");
    const blocks = ldBlocks(html);
    const unparseable = blocks.filter((b) => b.__unparseable);
    assert.deepEqual(unparseable, [], `unparseable JSON-LD on /about: ${JSON.stringify(unparseable)}`);
    const person = blocks.find((b) => b["@type"] === "Person");
    assert.ok(person, "no Person node in the rendered /about");
    assert.equal(person["@id"], personLd()["@id"]);
    assert.ok(!JSON.stringify(person).includes("null"), "the rendered Person node contains a null");
    const org = blocks.find((b) => b["@type"] === "Organization");
    assert.ok(org, "no Organization node reached /about (it comes from the root layout)");
    assert.equal(org.founder["@id"], person["@id"], "founder does not resolve to this page's Person");
  });

  await okAsync("live articles carry a visible byline and a complete Article node", async () => {
    const slug = allPostsSorted()[0].slug;
    const { status, html } = await get(`/blog/${slug}`);
    assert.equal(status, 200, `/blog/${slug} did not 200`);
    assert.match(html, /rel="author"/, "no rel=author byline in the rendered article");
    const article = ldBlocks(html).find((b) => b["@type"] === "Article");
    assert.ok(article, "no Article node in the rendered article");
    assert.ok(article.image, "Article.image is missing from the rendered page");
    assert.equal(article.author["@type"], "Person", "rendered Article.author is not a Person");
    assert.equal(article.author["@id"], personLd()["@id"], "rendered Article.author is not the /about Person");
    assert.ok(article.datePublished, "rendered Article has no datePublished");
  });

  await okAsync("the Organization logo actually serves an image", async () => {
    const res = await fetch(organizationLd().logo.url);
    assert.equal(res.status, 200, `schema logo ${organizationLd().logo.url} returned ${res.status}`);
    assert.match(res.headers.get("content-type") || "", /^image\//, "schema logo is not an image");
  });

  await okAsync("every internal link on /about resolves", async () => {
    const { html } = await get("/about");
    const paths = [...new Set([...html.matchAll(/href="(\/[a-z0-9][^"#?]*)"/g)].map((m) => m[1]))];
    // Only the links inside the prose matter here, but checking them all is
    // cheap and catches a nav regression too. /about links were hand-verified
    // once in M145; this is what keeps them verified.
    const broken = [];
    for (const p of paths) {
      const res = await fetch(`${BASE}${p}`, { method: "HEAD", redirect: "follow" });
      if (res.status >= 400) broken.push(`${p} -> ${res.status}`);
    }
    assert.deepEqual(broken, [], `broken links on /about: ${broken.join(", ")}`);
  });
}

console.log(
  `\n  E-E-A-T identity: ${pass} passed, ${failed} failed${BASE ? ` (incl. live assertions against ${BASE})` : " (static only — pass a base URL for live)"}\n`,
);
if (failed) process.exit(1);

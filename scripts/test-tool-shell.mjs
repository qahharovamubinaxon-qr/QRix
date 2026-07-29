/* Guard for ImageToolShell — the server-rendered stand-in that makes the tool
   area of 242 programmatic URLs visible to a crawler (M147, M147b).

   Every failure mode here is silent in production:
   - the shell stops emitting input[type=file] / <label for> and those pages go
     back to serving an article about a tool with no tool on it;
   - the localized twins fall back to English, so 102 RU/UZ URLs show a control
     in the wrong language (the M125 defect, re-introduced);
   - `engineTarget()` starts GUESSING an output format for an engine it cannot
     name, which puts a false claim on the page;
   - the output phrase is written as two adjacent JSX expressions, so hydratable
     SSR splits it into "Output<!-- -->: <!-- -->JPG" — visible to no grep and to
     no reader, only to the crawler that gets the split markup;
   - the label's `for` drifts from the input's id and the control loses its name;
   - the registry stops passing engine/lang, or starts offering a file picker on
     color:gradient, which has no upload at all.

   Renders the real component with react-dom/server — no dev server, no build —
   by transpiling the TSX in place, so what is asserted is what ships.
   Run: npm run test:shell */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import React from "react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "components/image/ImageToolShell.tsx");
const tmp = path.join(root, "components/image/__shell-under-test.mjs");

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* Transpiled next to the original so "react-icons/fi" resolves identically. */
const js = ts.transpileModule(fs.readFileSync(src, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
fs.writeFileSync(tmp, js);

try {
  const mod = await import(`file:///${tmp.replace(/\\/g, "/")}`);
  const Shell = mod.default;
  const { engineTarget } = mod;
  const html = (props) => renderToStaticMarkup(React.createElement(Shell, props));

  /* 1. the anatomy a crawler and a screen reader need */
  const en = html({ engine: "convert:jpeg" });
  ok("en: renders input[type=file]", /type="file"/.test(en));
  ok("en: the input is visible, not a hidden one", !/class="[^"]*\bhidden\b/.test(en));
  const forId = /<label[^>]*for="([^"]+)"/.exec(en)?.[1];
  const inputId = /<input[^>]*id="([^"]+)"/.exec(en)?.[1];
  ok("en: label points at the real input", !!forId && forId === inputId, `for=${forId} id=${inputId}`);
  ok("en: prompt text present", /Choose an image/.test(en));
  ok("en: noscript states the JS requirement", /<noscript>[\s\S]*needs JavaScript enabled/.test(en));

  /* 2. the engine names its own output, so the copy differs per URL */
  ok("en: convert:jpeg says Output: JPG", /Output: JPG/.test(en));
  ok("resize: prints the real size", /Output: 1920×1080/.test(html({ engine: "resize:1920x1080" })));
  ok("unnamed engine omits the line", !/Output/.test(html({ engine: "fx:blur" })));
  ok("no engine at all omits the line", !/Output/.test(html({})));

  /* 3. localization — an English control on a RU/UZ page is a regression */
  const ru = html({ engine: "convert:webp", lang: "ru" });
  ok("ru: localized prompt", /Выберите изображение/.test(ru));
  ok("ru: localized hint", /обрабатывается на вашем устройстве/.test(ru));
  ok("ru: localized noscript", /нужен включённый JavaScript/.test(ru));
  ok("ru: localized output label", /Результат: WebP/.test(ru));
  ok("ru: no English leak", !/Choose an image|Output:|JPG, PNG or WebP|needs JavaScript/.test(ru));
  const uz = html({ engine: "resize:800x600", lang: "uz", multiple: true });
  ok("uz: localized plural prompt", /Rasmlarni tanlang/.test(uz));
  ok("uz: localized hint", /qurilmangizda ishlanadi/.test(uz));
  ok("uz: localized output label", /Natija: 800×600/.test(uz));
  ok("uz: no English leak", !/Choose image|Output:|JPG, PNG or WebP|needs JavaScript/.test(uz));

  /* 4. a caller with something more specific to say still wins */
  ok("explicit label overrides the localized default", /Drop your receipts/.test(html({ label: "Drop your receipts", lang: "ru" })));

  /* 5. batch/layout engines take a selection, not one file */
  const many = html({ engine: "batch:compress", multiple: true });
  ok("batch: multiple attribute", /multiple/.test(many));
  ok("batch: plural prompt", /Choose images/.test(many));

  /* 6. engineTarget must never guess */
  ok("target: convert:jpeg", engineTarget("convert:jpeg") === "JPG");
  ok("target: convert:webp", engineTarget("convert:webp") === "WebP");
  ok("target: unknown mime is null", engineTarget("convert:heic") === null);
  ok("target: resize size", engineTarget("resize:1080x1080") === "1080×1080");
  ok("target: malformed resize is null", engineTarget("resize:instagram") === null);
  ok("target: other engines null", engineTarget("special:passport") === null);
  ok("target: undefined is null", engineTarget(undefined) === null);

  /* 7. hydratable SSR splits adjacent JSX text nodes with an HTML comment, so
        `{t.out}: {target}` would reach a crawler as "Output<!-- -->: <!-- -->JPG".
        renderToString reproduces that; renderToStaticMarkup does not, which is
        why the phrase is asserted against both. */
  const ssr = renderToString(React.createElement(Shell, { engine: "convert:jpeg" }));
  ok("ssr: output phrase is one uninterrupted text node", /Output: JPG/.test(ssr),
    /Output/.test(ssr) ? "found but split by comment nodes" : "missing entirely");
  ok("ssr: localized phrase intact", /Natija: 1080×1080/.test(
    renderToString(React.createElement(Shell, { engine: "resize:1080x1080", lang: "uz" }))));

  /* 8. the registry has to pass what the shell needs, and must not offer an
        upload on the one engine that takes none */
  const reg = fs.readFileSync(path.join(root, "components/image/ImageEngineRegistry.tsx"), "utf8");
  ok("registry: passes the engine key", /<ImageToolShell[\s\S]{0,220}engine=\{engine\}/.test(reg));
  ok("registry: passes the language", /<ImageToolShell[\s\S]{0,220}lang=\{lang\}/.test(reg));
  ok("registry: color:gradient gets no dropzone", /engine !== "color:gradient"/.test(reg));
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log(`${pass}/${pass + fails.length} assertions passed`);
if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}

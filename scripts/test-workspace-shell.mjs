/* Guard for the server-rendered image workspace shell (M147).

   What can silently break here, and why each is worth an assertion:
   - the shell stops emitting input[type=file] / <label for> and the ~120
     programmatic /convert + /resize pages go back to serving crawlers a spinner
     with no main content — invisible in HTML, which is what kept them out of
     the index;
   - the localized twins fall back to English, so 2/3 of those URLs would show
     RU/UZ readers an English control (the M125 mistake);
   - engineTarget() starts GUESSING an output format for engines it cannot name,
     putting a wrong claim on the page;
   - the label's `for` drifts from the input's id and the dropzone stops being
     labelled at all for a screen reader.

   Renders the real component with react-dom/server (no dev server, no build) by
   transpiling the TSX in place, so the strings asserted here are the strings
   that ship. Run: npm run test:shell */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import React from "react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "components/image/ImageWorkspaceShell.tsx");
const tmp = path.join(root, "components/image/__shell-under-test.mjs");

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* Transpile next to the original so "react-icons/fi" resolves identically. */
const js = ts.transpileModule(fs.readFileSync(src, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
fs.writeFileSync(tmp, js);

try {
  const mod = await import(path.toNamespaceURL ? path.toNamespaceURL(tmp) : `file:///${tmp.replace(/\\/g, "/")}`);
  const Shell = mod.default;
  const { engineTarget } = mod;
  const html = (props) => renderToStaticMarkup(React.createElement(Shell, props));

  /* 1. the anatomy a crawler and a screen reader need */
  const en = html({ engine: "convert:jpeg" });
  ok("en: renders input[type=file]", /type="file"/.test(en));
  ok("en: input is inert while the chunk loads", /disabled/.test(en) && /aria-busy="true"/.test(en));
  ok("en: no spinner copy", !/Loading the image workspace/.test(en));
  const forId = /<label[^>]*for="([^"]+)"/.exec(en)?.[1];
  const inputId = /<input[^>]*id="([^"]+)"/.exec(en)?.[1];
  ok("en: label points at the real input", !!forId && forId === inputId, `for=${forId} id=${inputId}`);
  ok("en: prompt text present", /Drop a file here/.test(en));

  /* 2. the engine names its own output, so the copy differs per URL */
  ok("en: convert:jpeg says Output: JPG", /Output: JPG/.test(en));
  ok("resize: prints the real size", /Output: 1920×1080/.test(html({ engine: "resize:1920x1080" })));
  ok("unnamed engine omits the line", !/Output/.test(html({ engine: "fx:blur" })));

  /* 3. localization — an English control on a RU/UZ page is a regression */
  const ru = html({ engine: "convert:jpeg", lang: "ru" });
  ok("ru: localized prompt", /Перетащите файл сюда/.test(ru));
  ok("ru: localized output label", /Результат: JPG/.test(ru));
  ok("ru: no English leak", !/Drop a file|Output:|Preparing/.test(ru));
  const uz = html({ engine: "resize:800x600", lang: "uz" });
  ok("uz: localized prompt", /Faylni shu yerga tashlang/.test(uz));
  ok("uz: localized output label", /Natija: 800×600/.test(uz));
  ok("uz: no English leak", !/Drop a file|Output:|Preparing/.test(uz));

  /* 4. batch engines take a selection, not one file */
  const many = html({ engine: "batch:compress", multiple: true });
  ok("batch: multiple attribute", /multiple/.test(many));
  ok("batch: plural prompt", /Drop your files here/.test(many));

  /* 5. engineTarget must never guess */
  ok("target: convert:jpeg", engineTarget("convert:jpeg") === "JPG");
  ok("target: convert:webp", engineTarget("convert:webp") === "WebP");
  ok("target: unknown mime is null", engineTarget("convert:heic") === null);
  ok("target: resize size", engineTarget("resize:1080x1080") === "1080×1080");
  ok("target: malformed resize is null", engineTarget("resize:instagram") === null);
  ok("target: other engines null", engineTarget("special:passport") === null);

  /* 5b. hydratable SSR splits adjacent JSX text nodes with an HTML comment, so
        `{t.out}: {target}` reaches a crawler as "Output<!-- -->: <!-- -->JPG".
        renderToString reproduces that; renderToStaticMarkup does not, which is
        why the phrase is asserted against both. */
  const ssr = renderToString(React.createElement(Shell, { engine: "convert:jpeg" }));
  ok("ssr: output phrase is one uninterrupted text node", /Output: JPG/.test(ssr),
    /Output/.test(ssr) ? "found but split by comment nodes" : "missing entirely");
  const ssrUz = renderToString(React.createElement(Shell, { engine: "resize:1080x1080", lang: "uz" }));
  ok("ssr: localized output phrase intact", /Natija: 1080×1080/.test(ssrUz));

  /* 6. the registry must actually USE the shell, and must not lie on the one
        engine that asks for no upload */
  const reg = fs.readFileSync(path.join(root, "components/image/ImageEngineRegistry.tsx"), "utf8");
  ok("registry: wraps engines in the shell provider", /ShellCtx\.Provider/.test(reg));
  ok("registry: fallback renders the shell", /ImageWorkspaceShell/.test(reg));
  ok("registry: color:gradient keeps the spinner", /engine === "color:gradient"/.test(reg));
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log(`${pass}/${pass + fails.length} assertions passed`);
if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}

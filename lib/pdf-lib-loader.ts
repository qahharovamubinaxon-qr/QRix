/* pdf-lib, on demand.
 *
 * pdf-lib is ~219 KB of eager JavaScript and it drags @pdf-lib/standard-fonts
 * (~152 KB of base64 AFM metrics) in behind it. Eleven tool clients imported it
 * statically, so every visitor to /pdf-tools/{merge,split,rotate,…} downloaded
 * and parsed ~400 KB before the page could hydrate — for a library that cannot
 * run until they have chosen a file. Measured on production: the routes that
 * import it eagerly ship ~1050 KB, /pdf-tools/compress (which already loaded it
 * on demand) ships 652 KB, and the image and convert templates 634-645 KB.
 *
 * Deferring on INTENT, never on paint (M139's rule): nothing here renders, so
 * a crawler never waits on it.
 *
 * The promise is cached at module scope so the second tool action is free, but
 * a REJECTED promise is not cached — a chunk fetch can fail where a static
 * import cannot (f212ba2), and a single dropped request must not turn the tool
 * into a permanently dead button.
 *
 * `import type` is erased before a bundler sees it, so the type import below
 * costs nothing and test:layout ignores it.
 */
import type * as PdfLib from "pdf-lib";
import type * as CantooPdfLib from "@cantoo/pdf-lib";

let pdfLib: Promise<typeof PdfLib> | null = null;
let cantoo: Promise<typeof CantooPdfLib> | null = null;

export function loadPdfLib(): Promise<typeof PdfLib> {
  if (!pdfLib) {
    pdfLib = import("pdf-lib").catch((err) => {
      pdfLib = null;
      throw err;
    });
  }
  return pdfLib;
}

/* @cantoo/pdf-lib is a separate package (it is the fork that can read and write
 * encrypted PDFs), so /pdf-tools/protect and /unlock get their own chunk. */
export function loadCantooPdfLib(): Promise<typeof CantooPdfLib> {
  if (!cantoo) {
    cantoo = import("@cantoo/pdf-lib").catch((err) => {
      cantoo = null;
      throw err;
    });
  }
  return cantoo;
}

/* Call when the user picks a file on a tool whose first pdf-lib use is behind a
 * later button press — the fetch then overlaps with them setting options, so the
 * click does not stall. Deliberately swallows: this is a hint, and the real load
 * path reports its own failure. */
export function warmPdfLib() {
  void loadPdfLib().catch(() => {});
}

export function warmCantooPdfLib() {
  void loadCantooPdfLib().catch(() => {});
}

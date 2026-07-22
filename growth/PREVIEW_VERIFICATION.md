# Verifying pages in the browser preview pane

Two traps cost three sessions (M120, M122, M123). Both are now solved. Read this
before concluding "the tool doesn't work in the pane".

## Trap 1 — the dev server serves the WRONG CHECKOUT

`preview_start` runs from the primary checkout (`D:/Projects/QRix`), not this
worktree, so every route that only exists on `design-v2` 404s locally while
returning 200 in production. The primary has no `app/convert`, `app/resize`,
`app/downloader`, `app/image-tools/[slug]` and no `lib/image-tools-meta.ts` at
all — but it *does* have a stale untracked `app/image-tools/exif-remover/`,
which is exactly why that one page seemed to work and everything else looked
broken.

**Use the `QRix Growth Worktree (design-v2)` launch config (port 3001), never
`QRix Dev Server` (port 3000).**

Confirm before trusting anything else — a worktree-only route must be 200:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/convert/png-to-webp
```

Do not probe with a folder whose name starts with `_`: App Router treats
`_name` as a private folder and never routes it, so it 404s even when correct.

## Trap 2 — hidden pane ⇒ requestAnimationFrame never fires ⇒ React never reveals

The pane runs the tab with `document.visibilityState === "hidden"`. Browsers do
not run `requestAnimationFrame` callbacks for a hidden document (timers still
run). React 19 gates its streaming-Suspense reveal on rAF:

```js
requestAnimationFrame(function(){ $RT = performance.now() });          // never fires
$RC = function(a,b){ ... "number" !== typeof $RT                        // so this stays undefined
                         ? requestAnimationFrame($RV.bind(null,$RB))    // ...and deadlocks here
                         : ... }
```

So any route whose server render is slow enough to flush the `app/loading.tsx`
fallback (in dev: every heavy registry page) **deadlocks permanently**:

- the page shows the `loading.tsx` shell ("QRix") forever,
- the real content sits parked in `<div hidden id="S:0">`,
- `dynamic(ssr:false)` engines inside it never mount,
- `document.body.innerText` stays ~126 chars whatever the page contains.

The lazy chunk was never the problem — it resolves fine once the boundary commits.

### Unblock (run after every navigate, before asserting anything)

```js
window.requestAnimationFrame = function (cb) { return setTimeout(function () { cb(performance.now()) }, 0) };
window.$RT = performance.now();
if (window.$RB && window.$RB.length) window.$RV(window.$RB);
```

Order matters: polyfill rAF first — React re-schedules `_reactRetry` through it
after the reveal. Re-run it after each navigation (a fresh document resets it).

Measured on `/image-tools/batch-compress`, and reproduced on `/convert/png-to-webp`:

| | before | after |
|---|---|---|
| `body.scrollHeight` | 900 | 2081 / 2099 |
| `input[type=file]` | 0 | 1 |
| "Loading the image workspace…" | present | gone |
| `body.innerText.length` | 126 | 1710 / 2770 |

Then the engine is fully drivable: injecting a file via `DataTransfer` +
`change` surfaces the real controls ("Quality", "Process 1 → ZIP"), and clicking
through produces a genuine `application/zip` (`PK` magic).

### Capturing a tool's output

Downloads don't land anywhere readable, so hook the blob instead of the anchor —
`fetch(blobUrl)` fails because the app revokes the URL immediately:

```js
const blobs = []; const orig = URL.createObjectURL;
URL.createObjectURL = function (b) { blobs.push(b); return orig.apply(URL, arguments) };
URL.revokeObjectURL = function () {};
HTMLAnchorElement.prototype.click = function () {};   // stop the real download
// ...drive the tool, then read blobs[0].arrayBuffer()
```

## Still true

`document.body.innerText` is unreliable in the pane — assert against the DOM
(`querySelectorAll`, `getBoundingClientRect`) or against `#main`.innerText, not
`body.innerText`.

`resize_window {preset:"desktop"}` means "reset to native size", and native is
0x0 on this pane — a silent no-op. Always pass explicit numbers:
`resize_window {width:1280, height:900}`.

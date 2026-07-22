/* ============================================================
   QRix AI Connector — the single seam between AI tool UIs and
   any future cloud engine (Replicate / Stability / OpenAI / own).

   Design contract:
   • UIs call `aiProcess(task, payload)` and never care which
     backend serves it.
   • Until NEXT_PUBLIC_AI_ENGINE is configured, `isAiEngineLive()`
     is false and "preview" tools show their on-device fallback +
     a clear "cloud engine" notice. No UI changes are needed to
     go live — only env vars.
   ============================================================ */

export type AiTask =
  | "colorize"        // b/w photo → color
  | "inpaint"         // image + mask → object removed
  | "describe"        // image → scene description
  | "translate"       // text → translated text
  | "transcribe"      // audio file → text
  | "generate-image"  // prompt → image
  | "improve-text";   // resume/caption polish

export function isAiEngineLive(): boolean {
  return !!process.env.NEXT_PUBLIC_AI_ENGINE;
}

/* ------------------------------------------------------------------
   Which engines leave the device once an engine IS configured.

   Every /ai-tools page renders a trust strip and a privacy FAQ. Both
   were hardcoded to the on-device answer, which is true today only
   because isAiEngineLive() is false — the moment NEXT_PUBLIC_AI_ENGINE
   is set, the pages below start doing their work over the network
   while still telling the reader the file never leaves the browser.
   So the claim is derived from this table instead of assumed.

   An engine is listed here only when the tool's own shipped copy
   already promises the cloud engine will do that work.
     replaces — the tool's main action goes to the cloud; every use
                sends something. The page becomes a cloud page.
     adds     — the local path keeps working and the cloud only adds a
                mode (file transcription, photoreal avatars, draft
                polish). The page stays on-device with a caveat, and
                the new mode discloses at its own control.
   Engines absent from this table never leave the device, live or not.

   `wired` is the half that is easy to get backwards. isAiEngineLive()
   only reports that an engine is CONFIGURED — and NEXT_PUBLIC_AI_ENGINE
   is already set in local envs while aiProcess() still has no callers
   anywhere in the app. Deriving the claim from the env var alone would
   therefore announce an upload that never happens, which is the same
   failure as the old hardcoded promise, just pointing the other way.
   A page's claim has to follow the code path that actually runs, so a
   route only counts once its client really calls aiProcess(); the
   suite in scripts/test-ai-claims.mjs holds the flag to the call sites
   in both directions.
   ------------------------------------------------------------------ */

export type CloudMode = "replaces" | "adds";
export type CloudRoute = {
  task: AiTask;
  sends: "file" | "text";
  mode: CloudMode;
  /** True only when this engine's client actually calls aiProcess(). */
  wired: boolean;
};

export const AI_CLOUD_ROUTES: Record<string, CloudRoute> = {
  "fx:colorize": { task: "colorize", sends: "file", mode: "replaces", wired: false },
  removeobj: { task: "inpaint", sends: "file", mode: "replaces", wired: false },
  describe: { task: "describe", sends: "file", mode: "replaces", wired: false },
  translate: { task: "translate", sends: "text", mode: "replaces", wired: false },
  imagegen: { task: "generate-image", sends: "text", mode: "replaces", wired: false },
  speech: { task: "transcribe", sends: "file", mode: "adds", wired: false },
  subtitles: { task: "transcribe", sends: "file", mode: "adds", wired: false },
  avatar: { task: "generate-image", sends: "text", mode: "adds", wired: false },
  resume: { task: "improve-text", sends: "text", mode: "adds", wired: false },
  captions: { task: "improve-text", sends: "text", mode: "adds", wired: false },
};

export function cloudRoute(engine: string): CloudRoute | undefined {
  return AI_CLOUD_ROUTES[engine];
}

/** Where an engine's work actually happens right now — the value the tool
 *  page's trust strip and privacy FAQ are built from. */
export function engineProcessing(engine: string): "device" | "cloud" | "hybrid" {
  const r = cloudRoute(engine);
  if (!r || !r.wired || !isAiEngineLive()) return "device";
  return r.mode === "replaces" ? "cloud" : "hybrid";
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Cloud AI engine is not configured yet");
    this.name = "AiNotConfiguredError";
  }
}

/**
 * Unified entry point for cloud AI work. Routes to /api/ai/process,
 * which holds the server-side keys. Throws AiNotConfiguredError when
 * no engine is configured so callers can fall back gracefully.
 */
export async function aiProcess<T = unknown>(
  task: AiTask,
  payload: Record<string, unknown>
): Promise<T> {
  if (!isAiEngineLive()) throw new AiNotConfiguredError();
  const r = await fetch("/api/ai/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, payload }),
  });
  if (!r.ok) throw new Error(`AI engine error (${r.status})`);
  return (await r.json()) as T;
}

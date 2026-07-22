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
   ------------------------------------------------------------------ */
export type CloudMode = "replaces" | "adds";
export type CloudRoute = { task: AiTask; sends: "file" | "text"; mode: CloudMode };

export const AI_CLOUD_ROUTES: Record<string, CloudRoute> = {
  "fx:colorize": { task: "colorize", sends: "file", mode: "replaces" },
  removeobj: { task: "inpaint", sends: "file", mode: "replaces" },
  describe: { task: "describe", sends: "file", mode: "replaces" },
  translate: { task: "translate", sends: "text", mode: "replaces" },
  imagegen: { task: "generate-image", sends: "text", mode: "replaces" },
  speech: { task: "transcribe", sends: "file", mode: "adds" },
  subtitles: { task: "transcribe", sends: "file", mode: "adds" },
  avatar: { task: "generate-image", sends: "text", mode: "adds" },
  resume: { task: "improve-text", sends: "text", mode: "adds" },
  captions: { task: "improve-text", sends: "text", mode: "adds" },
};

export function cloudRoute(engine: string): CloudRoute | undefined {
  return AI_CLOUD_ROUTES[engine];
}

/** Where an engine's work actually happens right now — the value the tool
 *  page's trust strip and privacy FAQ are built from. */
export function engineProcessing(engine: string): "device" | "cloud" | "hybrid" {
  const r = cloudRoute(engine);
  if (!r || !isAiEngineLive()) return "device";
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

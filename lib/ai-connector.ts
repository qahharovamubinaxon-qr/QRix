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

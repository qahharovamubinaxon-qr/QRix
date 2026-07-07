/**
 * Legacy AI adapter surface — now a thin shim over the AI Provider Manager
 * (lib/server/ai/manager.ts). Tools and the job queue keep calling
 * `runAi(tool, input)`; routing, fallback, caching and health tracking all
 * happen inside the manager. Never call providers directly. SERVER ONLY.
 */
import { runAiTask, providerStatus } from "../ai/manager";
import type { AiTaskKind, AiInput } from "../ai/providers";
import { serverConfig } from "../config";

/** Map tool/task names coming from clients and the queue to task kinds. */
export function toTaskKind(tool: string): AiTaskKind {
  const t = tool.toLowerCase();
  if (/(generate|imagegen|text-to-image|poster|art)/.test(t)) return "image-generate";
  if (/(ocr|image-to-text|extract-text)/.test(t)) return "ocr";
  if (/(describe|caption|analyz|vision|detect)/.test(t)) return "image-analyze";
  if (/(translate)/.test(t)) return "translate";
  if (/(summar|tldr)/.test(t)) return "summarize";
  if (/(code|regex|sql|script)/.test(t)) return "code";
  if (/(transcribe|speech|audio)/.test(t)) return "transcribe";
  return "text";
}

function toInput(input: unknown): AiInput {
  const o = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  return {
    prompt: String(o.prompt ?? o.text ?? o.query ?? ""),
    image: typeof o.image === "string" ? o.image : undefined,
    targetLang: typeof o.targetLang === "string" ? o.targetLang : undefined,
    system: typeof o.system === "string" ? o.system : undefined,
    maxTokens: typeof o.maxTokens === "number" ? o.maxTokens : undefined,
  };
}

/** Unified AI entry — routes through the Provider Manager with fallback.
    When no provider is configured, returns the on-device signal so client
    tools keep their local fallbacks (never an error to the user). */
export async function runAi(tool: string, input: unknown) {
  const task = toTaskKind(tool);
  try {
    const res = await runAiTask(task, toInput(input));
    return { provider: res.provider, tool, task, status: "ok" as const, text: res.text, imageUrl: res.imageUrl, cached: res.cached, latencyMs: res.latencyMs };
  } catch {
    return { provider: serverConfig.providers.ai, tool, task, status: "on-device" as const, note: "no cloud provider available — using on-device fallback", input };
  }
}

/** Admin status (legacy shape kept for the System tab). */
export const aiProviderStatus = () => providerStatus();

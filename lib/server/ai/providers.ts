/**
 * AI provider registry — one pluggable adapter per provider. Each adapter
 * implements the same minimal contract so the manager can route, fall back
 * and measure without caring who serves the request. SERVER ONLY.
 *
 * Adding a provider = append one entry to PROVIDERS. Nothing else changes.
 */

export type AiTaskKind =
  | "text" | "summarize" | "translate" | "code"
  | "image-generate" | "image-analyze" | "ocr"
  | "transcribe" | "3d-generate";

export type ProviderId =
  | "gemini" | "groq" | "openrouter" | "cloudflare" | "huggingface"
  | "openai" | "anthropic" | "replicate" | "fal" | "stability" | "custom";

export interface AiInput {
  prompt: string;
  /** data-URL or https URL for image tasks */
  image?: string;
  /** ISO-639 target for translate */
  targetLang?: string;
  system?: string;
  maxTokens?: number;
}

export interface AiOutput {
  text?: string;
  imageUrl?: string;
  raw?: unknown;
  tokens?: number;
}

export interface ProviderDef {
  id: ProviderId;
  name: string;
  envKey: string;
  free: boolean;
  capabilities: AiTaskKind[];
  /** rough $ per 1M tokens (text) or per image, for admin cost estimation */
  costPerUnit: number;
  call(task: AiTaskKind, input: AiInput, apiKey: string): Promise<AiOutput>;
}

/** Errors the manager treats as "switch provider now". */
export class RateLimitError extends Error { constructor(m = "rate_limited") { super(m); this.name = "RateLimitError"; } }
export class ProviderError extends Error { constructor(m: string) { super(m); this.name = "ProviderError"; } }

async function post(url: string, body: unknown, headers: Record<string, string>): Promise<Record<string, unknown>> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  if (r.status === 429 || r.status === 402) throw new RateLimitError();
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw new ProviderError(`${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return j;
}

const asChat = (input: AiInput) => [
  ...(input.system ? [{ role: "system", content: input.system }] : []),
  { role: "user", content: input.prompt },
];

/** Wrap a task as a plain prompt for chat-only providers. */
function taskPrompt(task: AiTaskKind, input: AiInput): string {
  switch (task) {
    case "summarize": return `Summarize the following concisely:\n\n${input.prompt}`;
    case "translate": return `Translate the following to ${input.targetLang || "English"}. Reply with the translation only:\n\n${input.prompt}`;
    case "code": return `You are an expert programmer. ${input.prompt}`;
    case "ocr": return `Extract all readable text from the image exactly as written.`;
    case "image-analyze": return input.prompt || "Describe this image in detail.";
    default: return input.prompt;
  }
}

// ─────────────────────────── Adapters ────────────────────────────

const gemini: ProviderDef = {
  id: "gemini", name: "Google Gemini", envKey: "GEMINI_API_KEY", free: true,
  capabilities: ["text", "summarize", "translate", "code", "image-analyze", "ocr"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    const parts: Record<string, unknown>[] = [{ text: taskPrompt(task, input) }];
    if (input.image && (task === "image-analyze" || task === "ocr")) {
      const [meta, data] = input.image.startsWith("data:") ? input.image.split(",") : ["data:image/png;base64", input.image];
      parts.push({ inline_data: { mime_type: meta.slice(5).split(";")[0] || "image/png", data } });
    }
    const j = await post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts }], generationConfig: { maxOutputTokens: input.maxTokens || 2048 } },
      {},
    );
    const cand = (j.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined)?.[0];
    const text = cand?.content?.parts?.map((p) => p.text || "").join("") || "";
    const usage = (j.usageMetadata as { totalTokenCount?: number } | undefined)?.totalTokenCount;
    return { text, raw: j, tokens: usage };
  },
};

const openAiCompatible = (
  id: ProviderId, name: string, envKey: string, free: boolean, url: string, model: string,
  cost: number, extraHeaders: (k: string) => Record<string, string> = (k) => ({ Authorization: `Bearer ${k}` }),
): ProviderDef => ({
  id, name, envKey, free,
  capabilities: ["text", "summarize", "translate", "code"],
  costPerUnit: cost,
  async call(task, input, apiKey) {
    const j = await post(url, { model, messages: asChat({ ...input, prompt: taskPrompt(task, input) }), max_tokens: input.maxTokens || 2048 }, extraHeaders(apiKey));
    const text = (j.choices as { message?: { content?: string } }[] | undefined)?.[0]?.message?.content || "";
    const tokens = (j.usage as { total_tokens?: number } | undefined)?.total_tokens;
    return { text, raw: j, tokens };
  },
});

const groq = openAiCompatible("groq", "Groq", "GROQ_API_KEY", true,
  "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile", 0);

const openrouter = openAiCompatible("openrouter", "OpenRouter", "OPENROUTER_API_KEY", true,
  "https://openrouter.ai/api/v1/chat/completions", "meta-llama/llama-3.3-70b-instruct:free", 0);

const openai = openAiCompatible("openai", "OpenAI", "OPENAI_API_KEY", false,
  "https://api.openai.com/v1/chat/completions", "gpt-4o-mini", 0.6);

const cloudflare: ProviderDef = {
  id: "cloudflare", name: "Cloudflare Workers AI", envKey: "CLOUDFLARE_API_KEY", free: true,
  capabilities: ["text", "summarize", "translate", "code", "image-generate"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    if (!account) throw new ProviderError("CLOUDFLARE_ACCOUNT_ID missing");
    const base = `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run`;
    if (task === "image-generate") {
      const r = await fetch(`${base}/@cf/black-forest-labs/flux-1-schnell`, {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.prompt }),
      });
      if (r.status === 429) throw new RateLimitError();
      if (!r.ok) throw new ProviderError(`${r.status}`);
      const j = (await r.json()) as { result?: { image?: string } };
      return { imageUrl: j.result?.image ? `data:image/png;base64,${j.result.image}` : undefined, raw: j };
    }
    const j = await post(`${base}/@cf/meta/llama-3.1-8b-instruct`,
      { messages: asChat({ ...input, prompt: taskPrompt(task, input) }) },
      { Authorization: `Bearer ${apiKey}` });
    return { text: (j.result as { response?: string } | undefined)?.response || "", raw: j };
  },
};

const huggingface: ProviderDef = {
  id: "huggingface", name: "HuggingFace", envKey: "HUGGINGFACE_API_KEY", free: true,
  capabilities: ["text", "summarize", "translate", "image-generate"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    if (task === "image-generate") {
      const r = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: input.prompt }),
      });
      if (r.status === 429 || r.status === 503) throw new RateLimitError();
      if (!r.ok) throw new ProviderError(`${r.status}`);
      const blob = await r.arrayBuffer();
      return { imageUrl: `data:image/png;base64,${Buffer.from(blob).toString("base64")}` };
    }
    const j = await post("https://router.huggingface.co/v1/chat/completions",
      { model: "meta-llama/Llama-3.3-70B-Instruct", messages: asChat({ ...input, prompt: taskPrompt(task, input) }) },
      { Authorization: `Bearer ${apiKey}` });
    return { text: (j.choices as { message?: { content?: string } }[] | undefined)?.[0]?.message?.content || "", raw: j };
  },
};

const anthropic: ProviderDef = {
  id: "anthropic", name: "Anthropic Claude", envKey: "ANTHROPIC_API_KEY", free: false,
  capabilities: ["text", "summarize", "translate", "code", "image-analyze", "ocr"],
  costPerUnit: 3,
  async call(task, input, apiKey) {
    const content: Record<string, unknown>[] = [{ type: "text", text: taskPrompt(task, input) }];
    if (input.image && (task === "image-analyze" || task === "ocr")) {
      const [meta, data] = input.image.startsWith("data:") ? input.image.split(",") : ["data:image/png;base64", input.image];
      content.unshift({ type: "image", source: { type: "base64", media_type: meta.slice(5).split(";")[0] || "image/png", data } });
    }
    const j = await post("https://api.anthropic.com/v1/messages",
      { model: "claude-haiku-4-5-20251001", max_tokens: input.maxTokens || 2048, system: input.system, messages: [{ role: "user", content }] },
      { "x-api-key": apiKey, "anthropic-version": "2023-06-01" });
    const text = (j.content as { type: string; text?: string }[] | undefined)?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
    const u = j.usage as { input_tokens?: number; output_tokens?: number } | undefined;
    return { text, raw: j, tokens: (u?.input_tokens || 0) + (u?.output_tokens || 0) };
  },
};

const replicate: ProviderDef = {
  id: "replicate", name: "Replicate", envKey: "REPLICATE_API_KEY", free: false,
  capabilities: ["image-generate", "3d-generate"],
  costPerUnit: 0.003,
  async call(task, input, apiKey) {
    if (task === "3d-generate") {
      // Image → 3D mesh (GLB) via TripoSR.
      const j = await post("https://api.replicate.com/v1/models/camenduru/tripo-sr/predictions",
        { input: { image_path: input.image } },
        { Authorization: `Bearer ${apiKey}`, Prefer: "wait" });
      const out = j.output as string | string[] | undefined;
      return { imageUrl: Array.isArray(out) ? out[0] : out, raw: j };
    }
    const j = await post("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      { input: { prompt: input.prompt } },
      { Authorization: `Bearer ${apiKey}`, Prefer: "wait" });
    const out = j.output as string | string[] | undefined;
    return { imageUrl: Array.isArray(out) ? out[0] : out, raw: j };
  },
};

const fal: ProviderDef = {
  id: "fal", name: "Fal.ai", envKey: "FAL_API_KEY", free: false,
  capabilities: ["image-generate", "3d-generate"],
  costPerUnit: 0.003,
  async call(task, input, apiKey) {
    if (task === "3d-generate") {
      // Image → 3D mesh (GLB) via TripoSR on fal.
      const j = await post("https://fal.run/fal-ai/triposr",
        { image_url: input.image, output_format: "glb" },
        { Authorization: `Key ${apiKey}` });
      const mesh = (j.model_mesh as { url?: string } | undefined)?.url || (j.mesh as { url?: string } | undefined)?.url;
      return { imageUrl: mesh, raw: j };
    }
    const j = await post("https://fal.run/fal-ai/flux/schnell",
      { prompt: input.prompt },
      { Authorization: `Key ${apiKey}` });
    const images = j.images as { url?: string }[] | undefined;
    return { imageUrl: images?.[0]?.url, raw: j };
  },
};

const stability: ProviderDef = {
  id: "stability", name: "Stability AI", envKey: "STABILITY_API_KEY", free: false,
  capabilities: ["image-generate"],
  costPerUnit: 0.03,
  async call(_task, input, apiKey) {
    const form = new FormData();
    form.set("prompt", input.prompt);
    form.set("output_format", "png");
    const r = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }, body: form,
    });
    if (r.status === 429) throw new RateLimitError();
    if (!r.ok) throw new ProviderError(`${r.status}`);
    const j = (await r.json()) as { image?: string };
    return { imageUrl: j.image ? `data:image/png;base64,${j.image}` : undefined, raw: j };
  },
};

/** Future custom provider — any endpoint speaking {task, input} → {text|imageUrl}. */
const custom: ProviderDef = {
  id: "custom", name: "Custom Provider", envKey: "CUSTOM_AI_KEY", free: true,
  capabilities: ["text", "summarize", "translate", "code", "image-generate", "image-analyze", "ocr", "transcribe"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    const url = process.env.CUSTOM_AI_URL?.trim() || process.env.AI_ENGINE_URL?.trim();
    if (!url) throw new ProviderError("CUSTOM_AI_URL missing");
    const j = await post(url, { task, input }, { Authorization: `Bearer ${apiKey}` });
    return { text: j.text as string | undefined, imageUrl: j.imageUrl as string | undefined, raw: j };
  },
};

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  gemini, groq, openrouter, cloudflare, huggingface,
  openai, anthropic, replicate, fal, stability, custom,
};

/** Mission-defined default priority: free providers first. */
export const DEFAULT_PRIORITY: ProviderId[] = [
  "gemini", "groq", "openrouter", "cloudflare", "huggingface",
  "openai", "anthropic", "replicate", "fal", "stability", "custom",
];

/** Smart routing — preferred provider order per task kind. */
export const TASK_ROUTES: Record<AiTaskKind, ProviderId[]> = {
  "text":           ["gemini", "groq", "openrouter", "cloudflare", "huggingface", "openai", "anthropic", "custom"],
  "summarize":      ["gemini", "groq", "openrouter", "cloudflare", "openai", "anthropic", "custom"],
  "translate":      ["gemini", "groq", "openrouter", "cloudflare", "openai", "anthropic", "custom"],
  "code":           ["groq", "gemini", "openrouter", "openai", "anthropic", "custom"],
  "image-generate": ["fal", "replicate", "cloudflare", "huggingface", "stability", "custom"],
  "image-analyze":  ["gemini", "anthropic", "custom"],
  "ocr":            ["gemini", "anthropic", "custom"],
  "transcribe":     ["custom", "gemini"],
  "3d-generate":    ["fal", "replicate", "openai", "huggingface", "openrouter", "custom"],
};

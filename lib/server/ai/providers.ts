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
  | "mistral" | "cerebras" | "cohere" | "nvidia" | "github"
  | "openai" | "anthropic" | "replicate" | "fal" | "stability"
  | "muapi" | "ollama" | "custom";

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
      // gemini-3.1-flash-lite: the roomiest free tier (500 req/day) and multimodal
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
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

// Free-tier providers from cheahjs/free-llm-api-resources (Mission 55).
// All speak the OpenAI chat schema, so the factory covers them.
const mistral = openAiCompatible("mistral", "Mistral La Plateforme", "MISTRAL_API_KEY", true,
  "https://api.mistral.ai/v1/chat/completions", "mistral-small-latest", 0);

const cerebras = openAiCompatible("cerebras", "Cerebras", "CEREBRAS_API_KEY", true,
  "https://api.cerebras.ai/v1/chat/completions", "gpt-oss-120b", 0); // llama-3.3-70b retired; gpt-oss-120b live (1M tok/day free)

const nvidia = openAiCompatible("nvidia", "NVIDIA NIM", "NVIDIA_API_KEY", true,
  "https://integrate.api.nvidia.com/v1/chat/completions", "meta/llama-3.3-70b-instruct", 0);

const github = openAiCompatible("github", "GitHub Models", "GITHUB_MODELS_TOKEN", true,
  "https://models.github.ai/inference/chat/completions", "openai/gpt-4o-mini", 0);

const cohere: ProviderDef = {
  id: "cohere", name: "Cohere", envKey: "COHERE_API_KEY", free: true,
  capabilities: ["text", "summarize", "translate", "code"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    const j = await post("https://api.cohere.com/v2/chat",
      { model: "command-r7b-12-2024", messages: asChat({ ...input, prompt: taskPrompt(task, input) }) },
      { Authorization: `Bearer ${apiKey}` });
    const msg = j.message as { content?: { type: string; text?: string }[] } | undefined;
    const text = msg?.content?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
    const u = j.usage as { tokens?: { input_tokens?: number; output_tokens?: number } } | undefined;
    return { text, raw: j, tokens: (u?.tokens?.input_tokens || 0) + (u?.tokens?.output_tokens || 0) };
  },
};

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

/** MuAPI — the engine behind Open-Generative-AI: 200+ image/video models
 *  behind one submit-and-poll API (Mission 55). */
const muapi: ProviderDef = {
  id: "muapi", name: "MuAPI", envKey: "MUAPI_API_KEY", free: false,
  capabilities: ["image-generate"],
  costPerUnit: 0.004,
  async call(_task, input, apiKey) {
    const model = process.env.MUAPI_IMAGE_MODEL?.trim() || "flux-schnell-image";
    const headers = { "x-api-key": apiKey };
    const submit = await post(`https://api.muapi.ai/api/v1/${model}`,
      { prompt: input.prompt, image_url: input.image || null }, headers);
    const requestId = (submit.request_id || submit.id) as string | undefined;
    if (!requestId) {
      const direct = (submit.outputs as string[] | undefined)?.[0] || (submit.url as string | undefined);
      return { imageUrl: direct, raw: submit };
    }
    // poll until the prediction settles (~2s cadence, ≤60 tries)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(`https://api.muapi.ai/api/v1/predictions/${requestId}/result`, { headers });
      if (res.status === 429 || res.status === 402) throw new RateLimitError();
      if (res.status >= 500) continue;
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new ProviderError(`${res.status}: ${JSON.stringify(j).slice(0, 160)}`);
      const status = String(j.status || "").toLowerCase();
      if (["completed", "succeeded", "success"].includes(status)) {
        const out = (j.outputs as string[] | undefined)?.[0]
          || (j.url as string | undefined)
          || ((j.output as { url?: string } | undefined)?.url);
        return { imageUrl: out, raw: j };
      }
      if (["failed", "error"].includes(status)) throw new ProviderError(String(j.error || "generation failed"));
    }
    throw new ProviderError("muapi poll timeout");
  },
};

/**
 * Ollama — a SELF-HOSTED model server (github.com/ollama/ollama). It runs on a machine
 * you control and exposes an OpenAI-compatible API on :11434. There is no hosted Ollama
 * cloud.
 *
 * It can NOT power a Vercel deployment: serverless has no GPU and no long-lived process.
 * It is wired for the two cases where it genuinely wins:
 *   1. Local development — exercise the AI tools offline without spending free-tier quota.
 *   2. On-prem / "bring your own model" — an Enterprise customer whose data must never
 *      leave their network points QRix at their own Ollama server.
 *
 * It sits LAST in every route, so the free cloud providers always win by default; an admin
 * can promote it to primary when on-prem inference is required.
 *
 * OLLAMA_URL doubles as the credential — its presence is what marks the provider ready
 * (e.g. http://localhost:11434). OLLAMA_MODEL picks the model. OLLAMA_API_KEY is optional
 * and only needed when the server sits behind an authenticating proxy.
 */
const ollama: ProviderDef = {
  id: "ollama", name: "Ollama (self-hosted)", envKey: "OLLAMA_URL", free: true,
  capabilities: ["text", "summarize", "translate", "code"],
  costPerUnit: 0,
  async call(task, input, apiKey) {
    const base = apiKey.trim().replace(/\/+$/, ""); // the "key" IS the base URL
    const token = process.env.OLLAMA_API_KEY?.trim();
    const j = await post(
      `${base}/v1/chat/completions`,
      {
        model: process.env.OLLAMA_MODEL?.trim() || "llama3.2",
        messages: asChat({ ...input, prompt: taskPrompt(task, input) }),
        max_tokens: input.maxTokens || 2048,
      },
      token ? { Authorization: `Bearer ${token}` } : {},
    );
    const choice = (j.choices as { message?: { content?: string } }[] | undefined)?.[0];
    const usage = (j.usage as { total_tokens?: number } | undefined)?.total_tokens;
    return { text: choice?.message?.content || "", raw: j, tokens: usage };
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
  mistral, cerebras, cohere, nvidia, github,
  openai, anthropic, replicate, fal, stability, muapi, ollama, custom,
};

/** Mission-defined default priority: free providers first. Self-hosted Ollama sits at
    the end — it only serves when nothing else is available, or when an admin promotes
    it to primary for on-prem inference. */
export const DEFAULT_PRIORITY: ProviderId[] = [
  "gemini", "groq", "openrouter", "cloudflare", "huggingface",
  "cerebras", "mistral", "cohere", "nvidia", "github",
  "openai", "anthropic", "replicate", "fal", "stability", "muapi", "ollama", "custom",
];

/** Smart routing — preferred provider order per task kind. */
export const TASK_ROUTES: Record<AiTaskKind, ProviderId[]> = {
  "text":           ["gemini", "groq", "openrouter", "cerebras", "mistral", "cohere", "nvidia", "github", "cloudflare", "huggingface", "openai", "anthropic", "ollama", "custom"],
  "summarize":      ["gemini", "groq", "openrouter", "cerebras", "mistral", "cohere", "cloudflare", "openai", "anthropic", "ollama", "custom"],
  "translate":      ["gemini", "groq", "openrouter", "mistral", "cohere", "cerebras", "cloudflare", "openai", "anthropic", "ollama", "custom"],
  "code":           ["groq", "cerebras", "gemini", "openrouter", "mistral", "nvidia", "github", "openai", "anthropic", "ollama", "custom"],
  "image-generate": ["fal", "replicate", "muapi", "cloudflare", "huggingface", "stability", "custom"],
  "image-analyze":  ["gemini", "anthropic", "custom"],
  "ocr":            ["gemini", "anthropic", "custom"],
  "transcribe":     ["custom", "gemini"],
  "3d-generate":    ["fal", "replicate", "openai", "huggingface", "openrouter", "custom"],
};

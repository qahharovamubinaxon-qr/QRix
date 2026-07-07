/**
 * AI provider abstraction. One `runAi(tool, input)` call routes to whichever
 * engine is configured via AI_PROVIDER: openai | gemini | replicate |
 * cloudflare | local. No paid API is required — unconfigured providers return a
 * structured "preview" result so the on-device UI fallback stays in control.
 * SERVER ONLY.
 */
import { serverConfig, type AiProvider } from "../config";

export interface AiProviderAdapter {
  name: AiProvider;
  ready: boolean;
  run(tool: string, input: unknown): Promise<unknown>;
}

const preview = (provider: AiProvider, tool: string, extra?: object) => ({
  provider, tool, status: "preview" as const,
  note: `${provider} not configured — using on-device fallback`, ...extra,
});

class OpenAiAdapter implements AiProviderAdapter {
  name: AiProvider = "openai";
  ready = !!serverConfig.providers.keys.openai;
  async run(tool: string, input: unknown) {
    if (!this.ready) return preview("openai", tool);
    // Real impl: call OpenAI images/chat with serverConfig.providers.keys.openai.
    return { provider: "openai", tool, status: "ok", input };
  }
}
class GeminiAdapter implements AiProviderAdapter {
  name: AiProvider = "gemini";
  ready = !!serverConfig.providers.keys.gemini;
  async run(tool: string, input: unknown) {
    if (!this.ready) return preview("gemini", tool);
    return { provider: "gemini", tool, status: "ok", input };
  }
}
class ReplicateAdapter implements AiProviderAdapter {
  name: AiProvider = "replicate";
  ready = !!serverConfig.providers.keys.replicate;
  async run(tool: string, input: unknown) {
    if (!this.ready) return preview("replicate", tool);
    return { provider: "replicate", tool, status: "ok", input };
  }
}
class CloudflareAdapter implements AiProviderAdapter {
  name: AiProvider = "cloudflare";
  ready = !!serverConfig.providers.keys.cloudflare && !!serverConfig.providers.keys.cloudflareAccount;
  async run(tool: string, input: unknown) {
    if (!this.ready) return preview("cloudflare", tool);
    return { provider: "cloudflare", tool, status: "ok", input };
  }
}
/** Local = signals the client to run the on-device engine (WASM/canvas). */
class LocalAdapter implements AiProviderAdapter {
  name: AiProvider = "local";
  ready = true;
  async run(tool: string, input: unknown) {
    return { provider: "local", tool, status: "on-device", input };
  }
}

const adapters: Record<AiProvider, AiProviderAdapter> = {
  openai: new OpenAiAdapter(), gemini: new GeminiAdapter(), replicate: new ReplicateAdapter(),
  cloudflare: new CloudflareAdapter(), local: new LocalAdapter(),
};

export const aiAdapter = (): AiProviderAdapter => adapters[serverConfig.providers.ai] ?? adapters.local;
export const runAi = (tool: string, input: unknown) => aiAdapter().run(tool, input);
export const aiProviderStatus = () =>
  (Object.values(adapters)).map((a) => ({ name: a.name, ready: a.ready, active: a.name === serverConfig.providers.ai }));

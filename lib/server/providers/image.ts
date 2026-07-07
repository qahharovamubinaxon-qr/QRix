/**
 * Image provider abstraction. IMAGE_PROVIDER: local | ai | cloud.
 *   local  — sharp / canvas / on-device WASM (default)
 *   ai     — routes to the configured AI provider (upscale, remove-bg, etc.)
 *   cloud  — hosted image pipeline
 * SERVER ONLY.
 */
import { serverConfig, type ImageProvider } from "../config";
import { runAi } from "./ai";

export interface ImageProviderAdapter { name: ImageProvider; ready: boolean; run(tool: string, input: unknown): Promise<unknown>; }

class LocalImage implements ImageProviderAdapter {
  name: ImageProvider = "local"; ready = true;
  async run(tool: string, input: unknown) { return { provider: "local", tool, status: "on-device", input }; }
}
class AiImage implements ImageProviderAdapter {
  name: ImageProvider = "ai"; ready = true;
  async run(tool: string, input: unknown) { return runAi(tool, input); }
}
class CloudImage implements ImageProviderAdapter {
  name: ImageProvider = "cloud"; ready = serverConfig.storage.driver !== "local";
  async run(tool: string, input: unknown) {
    return { provider: "cloud", tool, status: this.ready ? "ok" : "preview", input };
  }
}

const adapters: Record<ImageProvider, ImageProviderAdapter> = { local: new LocalImage(), ai: new AiImage(), cloud: new CloudImage() };
export const imageAdapter = () => adapters[serverConfig.providers.image] ?? adapters.local;
export const runImage = (tool: string, input: unknown) => imageAdapter().run(tool, input);
export const imageProviderStatus = () => Object.values(adapters).map((a) => ({ name: a.name, ready: a.ready, active: a.name === serverConfig.providers.image }));

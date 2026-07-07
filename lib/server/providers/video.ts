/**
 * Video provider abstraction. VIDEO_PROVIDER: ffmpeg | cloud | local.
 *   local  — client-side canvas→MediaRecorder pipeline (default, no server)
 *   ffmpeg — server-side ffmpeg worker (VIDEO_ENCODER_URL)
 *   cloud  — hosted encoder API
 * SERVER ONLY.
 */
import { serverConfig, type VideoProvider } from "../config";

export interface VideoProviderAdapter { name: VideoProvider; ready: boolean; run(tool: string, input: unknown): Promise<unknown>; }

class LocalVideo implements VideoProviderAdapter {
  name: VideoProvider = "local"; ready = true;
  async run(tool: string, input: unknown) { return { provider: "local", tool, status: "on-device", input }; }
}
class FfmpegVideo implements VideoProviderAdapter {
  name: VideoProvider = "ffmpeg"; ready = !!serverConfig.providers.keys.encoderUrl;
  async run(tool: string, input: unknown) {
    if (!this.ready) return { provider: "ffmpeg", tool, status: "preview", note: "VIDEO_ENCODER_URL not set" };
    // Real impl: POST job to the ffmpeg worker and stream progress back.
    return { provider: "ffmpeg", tool, status: "ok", input };
  }
}
class CloudVideo implements VideoProviderAdapter {
  name: VideoProvider = "cloud"; ready = !!serverConfig.providers.keys.encoderUrl;
  async run(tool: string, input: unknown) {
    if (!this.ready) return { provider: "cloud", tool, status: "preview", note: "encoder not configured" };
    return { provider: "cloud", tool, status: "ok", input };
  }
}

const adapters: Record<VideoProvider, VideoProviderAdapter> = { local: new LocalVideo(), ffmpeg: new FfmpegVideo(), cloud: new CloudVideo() };
export const videoAdapter = () => adapters[serverConfig.providers.video] ?? adapters.local;
export const runVideo = (tool: string, input: unknown) => videoAdapter().run(tool, input);
export const videoProviderStatus = () => Object.values(adapters).map((a) => ({ name: a.name, ready: a.ready, active: a.name === serverConfig.providers.video }));

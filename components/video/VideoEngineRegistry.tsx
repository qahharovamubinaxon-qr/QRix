"use client";

/* Maps a video tool's `engine` key to its client. Lazy-loaded. */

import dynamic from "next/dynamic";
import { AiProcessing } from "@/components/ai/AiKit";

const loading = () => <AiProcessing label="Loading the video workspace…" />;

const VideoRecodeClient = dynamic(() => import("@/components/video/VideoRecodeClient"), { loading, ssr: false });
const VideoMetaClient = dynamic(() => import("@/components/video/VideoUtilClients").then((m) => m.VideoMetaClient), { loading, ssr: false });
const VideoThumbClient = dynamic(() => import("@/components/video/VideoUtilClients").then((m) => m.VideoThumbClient), { loading, ssr: false });
const VideoFramesClient = dynamic(() => import("@/components/video/VideoUtilClients").then((m) => m.VideoFramesClient), { loading, ssr: false });
const VideoReverseClient = dynamic(() => import("@/components/video/VideoUtilClients").then((m) => m.VideoReverseClient), { loading, ssr: false });
const AudioExtractClient = dynamic(() => import("@/components/video/VideoAudioGifClients").then((m) => m.AudioExtractClient), { loading, ssr: false });
const Mp3ToMp4Client = dynamic(() => import("@/components/video/VideoAudioGifClients").then((m) => m.Mp3ToMp4Client), { loading, ssr: false });
const AddAudioClient = dynamic(() => import("@/components/video/VideoAudioGifClients").then((m) => m.AddAudioClient), { loading, ssr: false });
const VideoToGifClient = dynamic(() => import("@/components/video/VideoAudioGifClients").then((m) => m.VideoToGifClient), { loading, ssr: false });
const GifToVideoClient = dynamic(() => import("@/components/video/VideoAudioGifClients").then((m) => m.GifToVideoClient), { loading, ssr: false });
const SrtEditorClient = dynamic(() => import("@/components/video/VideoSubtitleClients").then((m) => m.SrtEditorClient), { loading, ssr: false });
const SrtTranslateClient = dynamic(() => import("@/components/video/VideoSubtitleClients").then((m) => m.SrtTranslateClient), { loading, ssr: false });
const AiSubtitlesClient = dynamic(() => import("@/components/ai/AiSpeechClients").then((m) => m.AiSubtitlesClient), { loading, ssr: false });

export default function VideoEngineRegistry({ engine }: { engine: string }) {
  if (engine.startsWith("recode:")) {
    return <VideoRecodeClient preset={engine.slice(7) as never} />;
  }
  switch (engine) {
    case "meta": return <VideoMetaClient />;
    case "thumbnail": return <VideoThumbClient />;
    case "frames": return <VideoFramesClient />;
    case "reverse": return <VideoReverseClient />;
    case "audio-extract": return <AudioExtractClient />;
    case "mp3-to-mp4": return <Mp3ToMp4Client />;
    case "add-audio": return <AddAudioClient />;
    case "togif": return <VideoToGifClient />;
    case "gif-to-mp4": return <GifToVideoClient />;
    case "srt-edit": return <SrtEditorClient />;
    case "srt-translate": return <SrtTranslateClient />;
    case "subgen": return <AiSubtitlesClient />;
    default: return null;
  }
}

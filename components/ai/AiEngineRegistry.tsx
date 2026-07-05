"use client";

/* Maps an AI tool's `engine` key to its client implementation.
   Heavy engines are lazy-loaded so tool pages stay light. */

import dynamic from "next/dynamic";
import { AiProcessing } from "@/components/ai/AiKit";

const loading = () => <AiProcessing label="Loading the AI workspace…" />;

const AiImageFxClient = dynamic(() => import("@/components/ai/AiImageFxClient"), { loading, ssr: false });
const RemoveBgClient = dynamic(() => import("@/components/RemoveBgClient"), { loading, ssr: false });
const ImageUpscaleClient = dynamic(() => import("@/components/ImageUpscaleClient"), { loading, ssr: false });
const ImageToTextClient = dynamic(() => import("@/components/ImageToTextClient"), { loading, ssr: false });
const PosterMakerClient = dynamic(() => import("@/components/PosterMakerClient"), { loading, ssr: false });
const AiCaptionsClient = dynamic(() => import("@/components/ai/AiTextClients").then((m) => m.AiCaptionsClient), { loading, ssr: false });
const AiPromptClient = dynamic(() => import("@/components/ai/AiTextClients").then((m) => m.AiPromptClient), { loading, ssr: false });
const AiTranslateClient = dynamic(() => import("@/components/ai/AiTextClients").then((m) => m.AiTranslateClient), { loading, ssr: false });
const AiSpeechClient = dynamic(() => import("@/components/ai/AiSpeechClients").then((m) => m.AiSpeechClient), { loading, ssr: false });
const AiSubtitlesClient = dynamic(() => import("@/components/ai/AiSpeechClients").then((m) => m.AiSubtitlesClient), { loading, ssr: false });
const AiQrClient = dynamic(() => import("@/components/ai/AiGenClients").then((m) => m.AiQrClient), { loading, ssr: false });
const AiLogoClient = dynamic(() => import("@/components/ai/AiGenClients").then((m) => m.AiLogoClient), { loading, ssr: false });
const AiAvatarClient = dynamic(() => import("@/components/ai/AiGenClients").then((m) => m.AiAvatarClient), { loading, ssr: false });
const AiTemplateClient = dynamic(() => import("@/components/ai/AiGenClients").then((m) => m.AiTemplateClient), { loading, ssr: false });
const AiResumeClient = dynamic(() => import("@/components/ai/AiWorkspaceClients").then((m) => m.AiResumeClient), { loading, ssr: false });
const AiImageGenClient = dynamic(() => import("@/components/ai/AiWorkspaceClients").then((m) => m.AiImageGenClient), { loading, ssr: false });
const AiRemoveObjClient = dynamic(() => import("@/components/ai/AiWorkspaceClients").then((m) => m.AiRemoveObjClient), { loading, ssr: false });
const AiDescribeClient = dynamic(() => import("@/components/ai/AiWorkspaceClients").then((m) => m.AiDescribeClient), { loading, ssr: false });

export default function AiEngineRegistry({ engine, status }: { engine: string; status: "live" | "preview" }) {
  const isPreview = status === "preview";
  if (engine.startsWith("fx:")) {
    return <AiImageFxClient preset={engine.slice(3) as never} isPreviewTool={isPreview} />;
  }
  if (engine.startsWith("template:")) {
    return <AiTemplateClient kind={engine.slice(9) as "thumbnail" | "banner"} />;
  }
  switch (engine) {
    case "removebg": return <RemoveBgClient />;
    case "upscale": return <ImageUpscaleClient />;
    case "ocr": return <ImageToTextClient />;
    case "poster": return <PosterMakerClient />;
    case "captions": return <AiCaptionsClient />;
    case "prompt": return <AiPromptClient />;
    case "translate": return <AiTranslateClient />;
    case "speech": return <AiSpeechClient />;
    case "subtitles": return <AiSubtitlesClient />;
    case "aiqr": return <AiQrClient />;
    case "logo": return <AiLogoClient />;
    case "avatar": return <AiAvatarClient />;
    case "resume": return <AiResumeClient />;
    case "imagegen": return <AiImageGenClient />;
    case "removeobj": return <AiRemoveObjClient />;
    case "describe": return <AiDescribeClient />;
    default: return null;
  }
}

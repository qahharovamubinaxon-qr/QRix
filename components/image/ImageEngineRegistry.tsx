"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";
import { AiProcessing } from "@/components/ai/AiKit";
import ImageWorkspaceShell from "@/components/image/ImageWorkspaceShell";

/* `dynamic()` fixes its `loading` component at module scope, but the shell that
   stands in for an engine has to know WHICH engine and which language it is
   standing in for. A context carries that without duplicating these fourteen
   declarations per language: Next renders `loading` in the child's own slot, so
   it lands inside the provider the registry wraps around every engine. */
type ShellInfo = { engine: string; lang?: "ru" | "uz"; multiple?: boolean };
const ShellCtx = createContext<ShellInfo | null>(null);

const loading = () => {
  const info = useContext(ShellCtx);
  /* No provider = an engine that takes no upload (color:gradient generates its
     image), where a dropzone would be a lie. Those keep the spinner. */
  if (!info) return <AiProcessing label="Loading the image workspace…" />;
  return <ImageWorkspaceShell engine={info.engine} lang={info.lang} multiple={info.multiple} />;
};

const ImageFxClient = dynamic(() => import("@/components/image/ImageFxClient"), { loading, ssr: false });
const ImageTransformClient = dynamic(() => import("@/components/image/ImageTransformClient"), { loading, ssr: false });
const ImageConvertClient = dynamic(() => import("@/components/image/ImageConvertClient"), { loading, ssr: false });
const ImageOverlayClient = dynamic(() => import("@/components/image/ImageOverlayClient"), { loading, ssr: false });
const ImageLayoutClient = dynamic(() => import("@/components/image/ImageLayoutClient"), { loading, ssr: false });
const ImageBatchClient = dynamic(() => import("@/components/image/ImageBatchClient"), { loading, ssr: false });
const ColorPickerClient = dynamic(() => import("@/components/image/ImageColorClients").then((m) => m.ColorPickerClient), { loading, ssr: false });
const DominantColorClient = dynamic(() => import("@/components/image/ImageColorClients").then((m) => m.DominantColorClient), { loading, ssr: false });
const GradientClient = dynamic(() => import("@/components/image/ImageColorClients").then((m) => m.GradientClient), { loading, ssr: false });
const HistogramClient = dynamic(() => import("@/components/image/ImageColorClients").then((m) => m.HistogramClient), { loading, ssr: false });
const ImageMetaClient = dynamic(() => import("@/components/image/ImageSpecialClients").then((m) => m.ImageMetaClient), { loading, ssr: false });
const ImageStudioClient = dynamic(() => import("@/components/image/ImageSpecialClients").then((m) => m.ImageStudioClient), { loading, ssr: false });
const PassportClient = dynamic(() => import("@/components/image/ImageSpecialClients").then((m) => m.PassportClient), { loading, ssr: false });

/* `lang` is only threaded into the sizing/convert engine: it is the one client
   whose controls the localized copy names out loud ("switch to «вписать»"), so
   English buttons there send RU/UZ readers looking for a control that isn't on
   the page. The other engines expose no such named control. */
export default function ImageEngineRegistry({ engine, lang }: { engine: string; lang?: "ru" | "uz" }) {
  const el = engineElement(engine, lang);
  /* color:gradient asks for no file, so it gets no dropzone shell. */
  if (engine === "color:gradient") return el;
  return (
    <ShellCtx.Provider value={{ engine, lang, multiple: engine.startsWith("batch:") }}>
      {el}
    </ShellCtx.Provider>
  );
}

function engineElement(engine: string, lang?: "ru" | "uz") {
  if (engine.startsWith("fx:")) return <ImageFxClient preset={engine.slice(3) as never} />;
  if (engine.startsWith("tf:")) return <ImageTransformClient preset={engine.slice(3) as never} />;
  if (engine.startsWith("convert:") || engine.startsWith("social:") || engine.startsWith("resize:")) return <ImageConvertClient engine={engine} lang={lang} />;
  if (engine.startsWith("overlay:")) return <ImageOverlayClient preset={engine.slice(8) as never} />;
  if (engine.startsWith("layout:")) return <ImageLayoutClient preset={engine.slice(7) as never} />;
  if (engine.startsWith("batch:")) return <ImageBatchClient preset={engine.slice(6) as never} />;
  if (engine.startsWith("meta:")) return <ImageMetaClient mode={engine.slice(5) as never} />;
  switch (engine) {
    case "color:picker": return <ColorPickerClient />;
    case "color:dominant": return <DominantColorClient />;
    case "color:palette": return <DominantColorClient palette />;
    case "color:gradient": return <GradientClient />;
    case "color:histogram": return <HistogramClient />;
    case "special:passport": return <PassportClient />;
    case "special:beautifier": return <ImageStudioClient mode="beautifier" />;
    case "special:device": return <ImageStudioClient mode="device" />;
    case "special:removewm": return <ImageStudioClient mode="removewm" />;
    default: return null;
  }
}

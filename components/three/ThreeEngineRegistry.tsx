"use client";

import dynamic from "next/dynamic";
import { AiProcessing } from "@/components/ai/AiKit";

/* 3D engine registry — maps registry engine keys to lazy clients.
   Three.js + R3F load only when a 3D tool page opens (code-split). */

const ImageTo3DClient = dynamic(() => import("./ImageTo3DClient"), {
  ssr: false,
  loading: () => <AiProcessing label="Loading 3D engine…" />,
});

export default function ThreeEngineRegistry({ engine }: { engine: string }) {
  switch (engine) {
    case "image-to-3d":
    default:
      return <ImageTo3DClient />;
  }
}

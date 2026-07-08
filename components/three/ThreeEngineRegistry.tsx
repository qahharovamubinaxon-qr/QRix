"use client";

import { lazy, Suspense } from "react";
import { AiProcessing } from "@/components/ai/AiKit";

/* 3D engine registry — maps registry engine keys to lazy clients.
   Three.js + R3F load only when a 3D tool page opens (code-split). */

const ImageTo3DClient = lazy(() => import("./ImageTo3DClient"));

export default function ThreeEngineRegistry({ engine }: { engine: string }) {
  switch (engine) {
    case "image-to-3d":
    default:
      return (
        <Suspense fallback={<AiProcessing label="Loading 3D engine…" />}>
          <ImageTo3DClient />
        </Suspense>
      );
  }
}

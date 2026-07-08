"use client";

import { useEffect, useRef } from "react";

/* Cinematic video backgrounds (Mission 21).
   ScrubVideo — paused; horizontal mouse movement scrubs the timeline
   (delta-based, sensitivity 0.8, chained via `seeked` so frames never drop).
   LoopVideo — plain autoplay/muted/loop cover layer. */

export function LoopVideo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <video
      src={src}
      autoPlay muted loop playsInline preload="metadata"
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      aria-hidden
    />
  );
}

export function ScrubVideo({ src, sensitivity = 0.8 }: { src: string; sensitivity?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const seeking = useRef(false);
  const lastX = useRef<number | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static first frame

    const seek = () => {
      if (!v.duration) return;
      const clamped = Math.max(0, Math.min(v.duration - 0.05, target.current));
      if (Math.abs(v.currentTime - clamped) < 0.02) { seeking.current = false; return; }
      seeking.current = true;
      v.currentTime = clamped;
    };
    const onSeeked = () => { seeking.current = false; seek(); }; // chain to the latest target

    const onMove = (e: PointerEvent) => {
      if (lastX.current === null) { lastX.current = e.clientX; return; }
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      if (!v.duration) return;
      target.current += (dx / window.innerWidth) * v.duration * sensitivity;
      if (!seeking.current) seek();
    };

    v.addEventListener("seeked", onSeeked);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      v.removeEventListener("seeked", onSeeked);
      window.removeEventListener("pointermove", onMove);
    };
  }, [sensitivity]);

  return (
    <video
      ref={ref}
      src={src}
      muted playsInline preload="auto"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      aria-hidden
    />
  );
}

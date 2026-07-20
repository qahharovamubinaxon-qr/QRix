"use client";

/* The homepage brand film — a real rendered 16:9 MP4 (product UI in motion,
   kinetic type). Autoplays muted, loops, and pauses when scrolled off-screen
   to keep it light. Replaces the old on-device canvas film in the hero card. */

import { useEffect, useRef } from "react";

export default function BrandFilmVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{ aspectRatio: "16 / 9", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(255,77,28,0.1)" }}>
      <video
        ref={ref}
        src="/qrix-brand-film.mp4"
        poster="/qrix-brand-film-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="QRix brand film"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

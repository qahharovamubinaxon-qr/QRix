"use client";

import { useEffect, useRef, useState } from "react";

/* Cinematic text primitives (Mission 21) — terminal-style scramble reveals.
   Zero deps, interval-driven, reduced-motion renders plain text instantly. */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/** Entrance reveal: characters decode left→right after `delay` ms. */
export function ScrambleIn({ text, delay = 0, triggered = true }: { text: string; delay?: number; triggered?: boolean }) {
  // SSR renders the real text (SEO + no blank hero while hydration runs);
  // once triggered, the decode animation takes over.
  const [out, setOut] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (!triggered || started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOut(text); return; }

    let cursor = 0;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        cursor += 0.5; // reveal speed: half a character per 25ms frame
        const c = Math.floor(cursor);
        let s = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") { s += " "; continue; }
          if (i < c) s += text[i];
          else if (i < c + 3) s += rand(); // noisy window ahead of the cursor
          // beyond the window: not rendered yet
        }
        setOut(s || " ");
        if (c >= text.length) { clearInterval(timer); setOut(text); }
      }, 25);
    }, delay);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [text, delay, triggered]);

  return <span aria-label={text}>{out}</span>;
}

/** Hover-driven scramble: decodes on hover, snaps back on leave. */
export function ScrambleText({ text, isHovered, className }: { text: string; isHovered: boolean; className?: string }) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!isHovered) { setOut(text); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / 4); // 4 frames per character
      let s = "";
      for (let i = 0; i < text.length; i++) {
        s += text[i] === " " ? " " : i < revealed ? text[i] : rand();
      }
      setOut(s);
      if (revealed >= text.length) { clearInterval(timer); setOut(text); }
    }, 25);
    return () => clearInterval(timer);
  }, [isHovered, text]);

  return <span className={className} aria-label={text}>{out}</span>;
}

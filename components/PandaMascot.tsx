"use client";

import { useEffect, useRef, useState } from "react";

type State = "walk" | "sit" | "wave" | "sleep";

const PANDA_SIZE = 56;

export default function PandaMascot() {
  const [pos, setPos] = useState({ x: 120, y: -1 }); // y=-1 means not mounted yet
  const [dir, setDir] = useState<1 | -1>(1);
  const [state, setState] = useState<State>("walk");
  const [visible, setVisible] = useState(false);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    // delay first appearance
    const show = setTimeout(() => {
      setPos({ x: Math.random() * (window.innerWidth - 120) + 60, y: window.innerHeight - PANDA_SIZE - 60 });
      setVisible(true);
      startBehavior();
    }, 2000);
    return () => { clearTimeout(show); clearAll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAll = () => {
    if (stateTimer.current) clearTimeout(stateTimer.current);
    if (moveTimer.current) clearInterval(moveTimer.current);
  };

  const startBehavior = () => {
    clearAll();
    const pick = Math.random();
    if (pick < 0.55) walk();
    else if (pick < 0.75) sit();
    else if (pick < 0.90) wave();
    else sleep();
  };

  const walk = () => {
    setState("walk");
    const speed = 1.2 + Math.random() * 1.4;
    const newDir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
    setDir(newDir);
    const duration = 2500 + Math.random() * 3000;
    let elapsed = 0;
    moveTimer.current = setInterval(() => {
      elapsed += 50;
      setPos(p => {
        const nx = p.x + speed * newDir;
        const clamped = Math.max(PANDA_SIZE / 2, Math.min(window.innerWidth - PANDA_SIZE / 2, nx));
        return { x: clamped, y: p.y };
      });
      if (elapsed >= duration) {
        clearInterval(moveTimer.current!);
        stateTimer.current = setTimeout(startBehavior, 300);
      }
    }, 50);
  };

  const sit = () => {
    setState("sit");
    stateTimer.current = setTimeout(startBehavior, 2500 + Math.random() * 2000);
  };

  const wave = () => {
    setState("wave");
    stateTimer.current = setTimeout(startBehavior, 2000 + Math.random() * 1500);
  };

  const sleep = () => {
    setState("sleep");
    stateTimer.current = setTimeout(startBehavior, 3500 + Math.random() * 2000);
  };

  if (!visible || pos.y < 0) return null;

  return (
    <div
      onClick={startBehavior}
      title="Click me! 🐼"
      style={{
        position: "fixed",
        left: pos.x,
        bottom: 12,
        width: PANDA_SIZE,
        height: PANDA_SIZE + 8,
        transform: `scaleX(${dir === -1 ? -1 : 1})`,
        transition: state === "walk" ? "left 0ms" : "left 0.4s ease",
        zIndex: 9999,
        cursor: "pointer",
        userSelect: "none",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
      }}
    >
      <PandaSVG state={state} />
    </div>
  );
}

function PandaSVG({ state }: { state: State }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 2), 350);
    return () => clearInterval(t);
  }, []);

  const walkBob = state === "walk" ? (frame === 0 ? 2 : 0) : 0;
  const waveDeg = state === "wave" ? (frame === 0 ? -35 : -55) : 0;
  const zzz = state === "sleep";
  const sitting = state === "sit" || state === "sleep";

  return (
    <svg width="56" height="64" viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="28" cy="62" rx="14" ry="3" fill="rgba(0,0,0,0.15)"/>

      {/* Body */}
      <ellipse cx="28" cy={44 + walkBob} rx="14" ry="16" fill="white" stroke="#1a1a1a" strokeWidth="1.5"/>

      {/* Belly spot */}
      <ellipse cx="28" cy={45 + walkBob} rx="8" ry="10" fill="#f0f0f0"/>

      {/* Legs */}
      {!sitting ? (
        <>
          <rect x="17" y={56 + walkBob} width="8" height="7" rx="4" fill="#1a1a1a"/>
          <rect x="31" y={56 + (frame === 0 && state === "walk" ? 0 : walkBob)} width="8" height="7" rx="4" fill="#1a1a1a"/>
        </>
      ) : (
        <>
          <rect x="14" y={54 + walkBob} width="10" height="6" rx="3" fill="#1a1a1a" transform="rotate(-20 14 54)"/>
          <rect x="32" y={54 + walkBob} width="10" height="6" rx="3" fill="#1a1a1a" transform="rotate(20 32 54)"/>
        </>
      )}

      {/* Arms */}
      <rect x="10" y={40 + walkBob} width="8" height="5" rx="3" fill="#1a1a1a"/>
      {/* Right arm — waves if state=wave */}
      <g transform={`rotate(${waveDeg}, 46, ${42 + walkBob})`}>
        <rect x="38" y={40 + walkBob} width="8" height="5" rx="3" fill="#1a1a1a"/>
      </g>

      {/* Head */}
      <circle cx="28" cy={22 + walkBob} r="16" fill="white" stroke="#1a1a1a" strokeWidth="1.5"/>

      {/* Ears */}
      <circle cx="14" cy={10 + walkBob} r="6" fill="#1a1a1a"/>
      <circle cx="42" cy={10 + walkBob} r="6" fill="#1a1a1a"/>
      <circle cx="14" cy={10 + walkBob} r="3" fill="#333"/>
      <circle cx="42" cy={10 + walkBob} r="3" fill="#333"/>

      {/* Eye patches */}
      <ellipse cx="21" cy={20 + walkBob} rx="5.5" ry="5" fill="#1a1a1a"/>
      <ellipse cx="35" cy={20 + walkBob} rx="5.5" ry="5" fill="#1a1a1a"/>

      {/* Eyes */}
      {zzz ? (
        <>
          <path d={`M18.5 ${20 + walkBob} Q21 ${18.5 + walkBob} 23.5 ${20 + walkBob}`} stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d={`M32.5 ${20 + walkBob} Q35 ${18.5 + walkBob} 37.5 ${20 + walkBob}`} stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </>
      ) : (
        <>
          <circle cx="21" cy={20 + walkBob} r="2.5" fill="white"/>
          <circle cx="35" cy={20 + walkBob} r="2.5" fill="white"/>
          <circle cx="21.8" cy={19.5 + walkBob} r="1.2" fill="#111"/>
          <circle cx="35.8" cy={19.5 + walkBob} r="1.2" fill="#111"/>
          {/* shine */}
          <circle cx="22.5" cy={18.8 + walkBob} r="0.5" fill="white"/>
          <circle cx="36.5" cy={18.8 + walkBob} r="0.5" fill="white"/>
        </>
      )}

      {/* Nose */}
      <ellipse cx="28" cy={25 + walkBob} rx="2.5" ry="1.5" fill="#1a1a1a"/>

      {/* Mouth */}
      {zzz
        ? <path d={`M25 ${27.5 + walkBob} Q28 ${30 + walkBob} 31 ${27.5 + walkBob}`} stroke="#999" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        : <path d={`M25 ${27.5 + walkBob} Q28 ${29 + walkBob} 31 ${27.5 + walkBob}`} stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      }

      {/* ZZZ sleep */}
      {zzz && (
        <>
          <text x="40" y={14 + walkBob} fontSize="9" fill="#6b7280" fontWeight="bold" opacity="0.8">z</text>
          <text x="44" y={8 + walkBob}  fontSize="7" fill="#6b7280" fontWeight="bold" opacity="0.6">z</text>
          <text x="47" y={3 + walkBob}  fontSize="5" fill="#6b7280" fontWeight="bold" opacity="0.4">z</text>
        </>
      )}

      {/* Wave hand indicator */}
      {state === "wave" && (
        <text x="38" y={30 + walkBob} fontSize="10">👋</text>
      )}
    </svg>
  );
}

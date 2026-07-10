"use client";

/* Tool Galaxy — the shoe-finder interaction adapted to QRix: 45 panda tool
   tiles float on a draggable canvas; click one to zoom in (others dim), a
   focus card appears with an "Open tool" link; click again or ✕ to zoom out. */

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { FiArrowRight, FiX, FiMove } from "react-icons/fi";
import { GALAXY_ITEMS, gridDims, basePos } from "./galaxyData";
import { rig } from "./galaxyState";
import { GalaxyRig } from "./GalaxyRig";
import { ToolTile } from "./ToolTile";

/* poll rig.activeId into React state (rig mutates outside React) */
function useActiveItem() {
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setActive((prev) => (prev === rig.activeId ? prev : rig.activeId));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return active;
}

function Scene() {
  const dims = useMemo(() => gridDims(GALAXY_ITEMS.length), []);
  useEffect(() => {
    rig.startTime = Date.now();
    rig.activeId = null;
    rig.zoom = rig.zoomOut;
    rig.target.set(0, 0, 0);
    rig.current.set(0, 0, 0);
  }, []);
  return (
    <>
      <fog attach="fog" args={["#070505", 18, 44]} />
      <GalaxyRig gridW={dims.width} gridH={dims.height} />
      {GALAXY_ITEMS.map((item, i) => {
        const p = basePos(i, GALAXY_ITEMS.length);
        return (
          <ToolTile key={item.slug} item={item} index={i}
            x={p.x} y={p.y} delay={(i % 9) * 55 + Math.floor(i / 9) * 90} />
        );
      })}
    </>
  );
}

export default function ToolGalaxy() {
  const active = useActiveItem();
  const item = active !== null ? GALAXY_ITEMS[active] : null;

  return (
    <div className="qx-galaxy" data-reveal>
      <Canvas
        camera={{ position: [0, 0, 24], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* drag hint */}
      <div className="qx-galaxy-hint qx-mono" aria-hidden data-hidden={active !== null}>
        <FiMove size={13} /> DRAG · CLICK A PANDA
      </div>

      {/* focus card */}
      {item && (
        <div className="qx-galaxy-card" style={{ ["--gc" as string]: item.color } as React.CSSProperties}>
          <span className="qx-galaxy-dot" aria-hidden />
          <span className="qx-galaxy-name">{item.name}</span>
          <Link href={item.href} className="qx-galaxy-open">
            {"Open tool"} <FiArrowRight size={13} />
          </Link>
          <button type="button" className="qx-galaxy-close" aria-label="Close"
            onClick={() => { rig.activeId = null; rig.zoom = rig.zoomOut; }}>
            <FiX size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

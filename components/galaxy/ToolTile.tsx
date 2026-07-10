"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import { rig, CFG } from "./galaxyState";
import type { GalaxyItem } from "./galaxyData";

/* One panda tile: icon plane + name label. Hover lifts it; click focuses
   (pan to center + zoom in, everyone else dims). Second click opens focus UI
   handled by the parent via rig.activeId. */
export function ToolTile({
  item, index, x, y, delay,
}: {
  item: GalaxyItem; index: number; x: number; y: number; delay: number;
}) {
  const group = useRef<THREE.Group>(null);
  const iconMat = useRef<THREE.MeshBasicMaterial>(null);
  const label = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(item.icon);

  const enterZ = useRef(CFG.enterStartZ);
  const scale = useRef(0.001);

  useFrame((state, delta) => {
    if (!group.current) return;
    const entered = Date.now() - rig.startTime > delay;

    // world position follows the rig
    const px = x + rig.current.x;
    const py = y + rig.current.y;

    // focus / dim states
    const focusMode = rig.activeId !== null;
    const active = rig.activeId === index;
    let targetScale = 1, targetOpacity = 1, targetZ = 0;
    if (!entered) {
      targetScale = 1; targetOpacity = 0; targetZ = CFG.enterStartZ;
    } else if (focusMode) {
      if (active) { targetScale = CFG.focusScale; targetZ = 2.2; }
      else { targetScale = CFG.dimScale; targetOpacity = CFG.dimOpacity; targetZ = -0.6; }
    } else if (hovered && !rig.isDragging) {
      targetScale = 1.13; targetZ = 0.6;
    }

    easing.damp(enterZ, "current", targetZ, 0.28, delta);
    easing.damp(scale, "current", targetScale, 0.16, delta);
    group.current.position.set(px, py, enterZ.current);
    group.current.scale.setScalar(scale.current);

    // gentle idle float, unique phase per tile
    if (entered && !focusMode) {
      group.current.position.y += Math.sin(state.clock.elapsedTime * 1.1 + index * 1.7) * 0.05;
    }

    if (iconMat.current) {
      easing.damp(iconMat.current, "opacity", targetOpacity, entered ? 0.2 : 0.5, delta);
    }
    if (label.current) {
      easing.damp(label.current, "fillOpacity", targetOpacity, 0.2, delta);
    }
  });

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (rig.isDragging) return;
    if (rig.activeId === index) {
      rig.activeId = null;
      rig.zoom = rig.zoomOut;
    } else {
      rig.activeId = index;
      rig.target.set(-x, -y, 0);
      rig.zoom = rig.zoomIn;
    }
  };

  return (
    <group ref={group}>
      {/* hit area */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = ""; }}
        onClick={onClick}
      >
        <planeGeometry args={[2.1, 2.4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {/* panda icon */}
      <mesh position={[0, 0.16, 0.01]}>
        <planeGeometry args={[1.78, 1.78]} />
        <meshBasicMaterial ref={iconMat} map={texture} transparent opacity={0} toneMapped={false} />
      </mesh>
      {/* name */}
      <Text
        ref={label}
        position={[0, -0.95, 0.01]}
        fontSize={0.185}
        font="/fonts/oswald-600.ttf"
        color="#f2ece5"
        outlineColor="#0a0605"
        outlineWidth={0.012}
        anchorX="center"
        anchorY="top"
        letterSpacing={0.04}
        fillOpacity={0}
      >
        {item.name.toUpperCase()}
      </Text>
    </group>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easing } from "maath";
import { rig, CFG } from "./galaxyState";

/* Camera rig — drag to pan (with bounds + resistance), damped follow,
   velocity tilt, damped zoom. Adapted from the reference Rig. */
export function GalaxyRig({ gridW, gridH }: { gridW: number; gridH: number }) {
  const { camera, gl } = useThree();
  const prev = useRef(new THREE.Vector3());

  const getBounds = () => {
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.z;
    const vFov = (cam.fov * Math.PI) / 180;
    const visH = 2 * Math.tan(vFov / 2) * dist;
    const visW = visH * cam.aspect;
    return {
      x: Math.max(0, (gridW - visW) / 2 + 1.4),
      y: Math.max(0, (gridH - visH) / 2 + 1.4),
      visH,
    };
  };

  useEffect(() => {
    const canvas = gl.domElement;
    let down = false, sx = 0, sy = 0, ix = 0, iy = 0, maxDist = 0;

    const onDown = (e: PointerEvent) => {
      down = true;
      sx = e.clientX; sy = e.clientY;
      ix = rig.target.x; iy = rig.target.y;
      maxDist = 0;
      rig.isDragging = false;
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      maxDist = Math.max(maxDist, Math.hypot(dx, dy));
      const threshold = "ontouchstart" in window ? 14 : CFG.clickThreshold;
      if (maxDist > threshold) { rig.isDragging = true; rig.activeId = null; }
      const { x: bx, y: by, visH } = getBounds();
      const sens = (visH / canvas.clientHeight) * CFG.dragSpeed;
      let tx = ix + dx * sens;
      let ty = iy - dy * sens;
      if (tx > bx) tx = bx + (tx - bx) * CFG.dragResistance;
      if (tx < -bx) tx = -bx + (tx + bx) * CFG.dragResistance;
      if (ty > by) ty = by + (ty - by) * CFG.dragResistance;
      if (ty < -by) ty = -by + (ty + by) * CFG.dragResistance;
      rig.target.set(
        Math.max(-bx - 2.5, Math.min(bx + 2.5, tx)),
        Math.max(-by - 2.5, Math.min(by + 2.5, ty)),
        0,
      );
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      rig.isDragging = false;
      canvas.style.cursor = "grab";
      if (rig.activeId !== null) return;
      const { x: bx, y: by } = getBounds();
      rig.target.set(
        Math.max(-bx, Math.min(bx, rig.target.x)),
        Math.max(-by, Math.min(by, rig.target.y)),
        0,
      );
    };

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y"; // keep page scroll on vertical touch
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, gridW, gridH]);

  useFrame((_, delta) => {
    easing.damp3(rig.current, rig.target, CFG.dampFactor, delta);
    easing.damp(camera.position, "z", rig.zoom, CFG.zoomDamp, delta);
    rig.velocity.copy(rig.current).sub(prev.current);
    prev.current.copy(rig.current);
    const zf = Math.min(1, rig.zoomIn / rig.zoom);
    easing.damp(camera.rotation, "x", rig.velocity.y * CFG.tiltFactor * zf, 0.2, delta);
    easing.damp(camera.rotation, "y", -rig.velocity.x * CFG.tiltFactor * zf, 0.2, delta);
  });

  return null;
}

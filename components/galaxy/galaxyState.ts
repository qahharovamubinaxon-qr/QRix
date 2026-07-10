import * as THREE from "three";

/* Shared rig state (module singleton, mutated inside the R3F loop) —
   same pattern as the reference shoe-finder grid. */
export const rig = {
  target: new THREE.Vector3(0, 0, 0),
  current: new THREE.Vector3(0, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  zoom: 24,          // camera z — damped every frame
  zoomOut: 24,
  zoomIn: 8.5,
  activeId: null as number | null,
  isDragging: false,
  startTime: 0,      // enter-stagger anchor
};

export const CFG = {
  dragSpeed: 2.1,
  dampFactor: 0.22,
  tiltFactor: 0.07,
  clickThreshold: 6,
  dragResistance: 0.25,
  zoomDamp: 0.3,
  focusScale: 1.55,
  dimScale: 0.72,
  dimOpacity: 0.13,
  enterStartZ: -34,
  enterStagger: 500,
  fogNear: 16,
  fogFar: 46,
};

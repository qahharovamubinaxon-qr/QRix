import React from "react";
import * as THREE from "three";

/**
 * Every object in this scene is built from primitives rather than loaded from
 * a model file.
 *
 * The reference video is a 3D artist's work: modelled, rigged, hand-animated.
 * Downloading a generic CC0 character pack would not close that gap — it would
 * just put someone else's generic character in the frame. What does carry
 * across is the *look*: faceted low-poly shapes, near-black materials, and all
 * the light coming from emissive surfaces through bloom. Those are reachable
 * with boxes, spheres and octahedra, and they stay on-brand because the
 * emissive colours are QRix's own.
 */

export const NAVY = "#0a1226";
export const ORANGE = "#ff4d1c";
export const CYAN = "#6fe3ff";
export const WOOD = "#5a4330";

/** Flat shading is what reads as "low-poly" — smooth normals read as cheap CGI. */
const facet = (color: string, rough = 0.75) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={0.05} flatShading />
);

export const Desk: React.FC = () => (
  <group>
    <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
      <boxGeometry args={[7.4, 0.12, 2.5]} />
      {facet(WOOD, 0.85)}
    </mesh>
    {[-3.2, 3.2].map((x) => (
      <mesh key={x} position={[x, -1.1, 0]}>
        <boxGeometry args={[0.16, 2.0, 0.16]} />
        {facet("#241a12", 0.9)}
      </mesh>
    ))}
    {/* Desk mat — gives the pointer somewhere to sit and breaks the wood up. */}
    <mesh position={[0.9, 0.02, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.6, 1.1]} />
      <meshStandardMaterial color="#14101a" roughness={0.95} />
    </mesh>
  </group>
);

export const Mug: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.17, 0.15, 0.38, 10]} />
      {facet("#2f6ee0", 0.6)}
    </mesh>
    <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.1, 0.035, 6, 12]} />
      {facet("#2f6ee0", 0.6)}
    </mesh>
  </group>
);

/**
 * The monitor. Its screen is a plane that takes whatever map is handed to it —
 * in practice the real recording of the tool, so the 3D set is showing the
 * actual product rather than a drawing of one.
 */
export const Monitor: React.FC<{
  map?: THREE.Texture | null;
  position?: [number, number, number];
}> = ({ map, position = [0, 1.28, -0.5] }) => (
  <group position={position}>
    <mesh position={[0, -1.1, 0]}>
      <boxGeometry args={[0.7, 0.08, 0.5]} />
      {facet("#15181f", 0.6)}
    </mesh>
    <mesh position={[0, -0.72, 0]}>
      <boxGeometry args={[0.14, 0.72, 0.14]} />
      {facet("#15181f", 0.6)}
    </mesh>
    <mesh castShadow>
      <boxGeometry args={[2.42, 2.64, 0.12]} />
      {facet("#0e1016", 0.55)}
    </mesh>
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[2.22, 2.44]} />
      {map ? (
        <meshBasicMaterial map={map} toneMapped={false} />
      ) : (
        <meshBasicMaterial color="#0d1326" toneMapped={false} />
      )}
    </mesh>
  </group>
);

/**
 * The person, seen from behind.
 *
 * A face would need modelling and acting; the back of a head needs neither,
 * and the reference leans on the same shot for its establishing frames. Lit
 * only by a rim, it reads as a person at a desk without ever claiming to be a
 * character performance.
 */
export const PersonFromBehind: React.FC<{ position?: [number, number, number] }> = ({
  position = [0, -0.55, 3.45],
}) => (
  <group position={position}>
    <mesh position={[0, 1.42, 0]} castShadow>
      <icosahedronGeometry args={[0.42, 1]} />
      {facet("#2a2320", 0.95)}
    </mesh>
    <mesh position={[0, 0.72, 0.06]} castShadow>
      <capsuleGeometry args={[0.46, 0.5, 3, 10]} />
      {facet("#161b24", 0.95)}
    </mesh>
    <mesh position={[0, 0.5, 0.52]}>
      <boxGeometry args={[1.26, 1.5, 0.16]} />
      {facet("#101319", 0.9)}
    </mesh>
  </group>
);

/**
 * The assistant.
 *
 * The one element of the reference that is genuinely within reach: it is a
 * faceted solid with a lit face, and both of those are primitives. The face is
 * an emissive plane with rounded eyes and a mouth, so its expression can carry
 * the beat — which is as close to character acting as this pipeline gets.
 */
export const Assistant: React.FC<{
  position: [number, number, number];
  scale?: number;
  spin: number;
  bob: number;
  color?: string;
  mouth?: number;
  blink?: number;
}> = ({ position, scale = 1, spin, bob, color = CYAN, mouth = 0.22, blink = 1 }) => (
  <group position={[position[0], position[1] + bob, position[2]]} scale={scale}>
    <mesh rotation={[0, spin, 0.12]}>
      <octahedronGeometry args={[0.95, 0]} />
      <meshStandardMaterial
        color="#e8e2d6"
        roughness={0.35}
        metalness={0.15}
        flatShading
        emissive={color}
        emissiveIntensity={0.14}
      />
    </mesh>
    {/* Shards orbiting the body — the reference's assistant has the same
        broken-apart silhouette, and they catch the bloom. */}
    {[0, 1, 2].map((i) => {
      const a = spin * 1.4 + (i * Math.PI * 2) / 3;
      return (
        <mesh
          key={i}
          position={[Math.cos(a) * 1.75, Math.sin(a * 1.7) * 0.42, Math.sin(a) * 1.9 - 0.95]}
          rotation={[a, a * 0.7, 0]}
        >
          <tetrahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial
            color="#e8e2d6"
            roughness={0.3}
            flatShading
            emissive={color}
            emissiveIntensity={0.25}
          />
        </mesh>
      );
    })}
    {/* Face */}
    {/* Clear of the body: the octahedron's front vertex reaches z=0.95,
        so a face at 0.78 was buried inside it. */}
    <group position={[0, 0.04, 1.02]}>
      <mesh>
        <planeGeometry args={[0.92, 0.62]} />
        <meshBasicMaterial color="#05070d" toneMapped={false} />
      </mesh>
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} position={[x, 0.1, 0.01]} scale={[1, blink, 1]}>
          <circleGeometry args={[0.062, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, -0.15, 0.01]} scale={[1, Math.max(0.3, Math.min(1.6, mouth / 0.2)), 1]}>
        <circleGeometry args={[0.055, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

/** Emissive glyphs built from bars — no font file to load, no network at render. */
export const CodeGlyph: React.FC<{
  position: [number, number, number];
  scale?: number;
  color?: string;
  rot?: number;
}> = ({ position, scale = 1, color = CYAN, rot = 0 }) => {
  const bar = (p: [number, number, number], r: number) => (
    <mesh position={p} rotation={[0, 0, r]}>
      <boxGeometry args={[0.46, 0.085, 0.085]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
  return (
    <group position={position} scale={scale} rotation={[0, rot, 0]}>
      {bar([-0.42, 0.16, 0], 0.72)}
      {bar([-0.42, -0.16, 0], -0.72)}
      {bar([0.42, 0.16, 0], -0.72)}
      {bar([0.42, -0.16, 0], 0.72)}
      <mesh rotation={[0, 0, 0.42]}>
        <boxGeometry args={[0.085, 0.78, 0.085]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Shelf: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {[0, 0.95].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <boxGeometry args={[3.2, 0.1, 0.5]} />
        {facet("#3b2d20", 0.9)}
      </mesh>
    ))}
    {Array.from({ length: 16 }).map((_, i) => {
      const h = 0.44 + ((i * 37) % 17) / 40;
      const shelf = i < 8 ? 0 : 0.95;
      const x = -1.4 + (i % 8) * 0.37;
      const hues = ["#7a3b3b", "#3b5a7a", "#4f7a3b", "#6b4f7a", "#7a6b3b"];
      return (
        <mesh key={i} position={[x, shelf + 0.05 + h / 2, 0]}>
          <boxGeometry args={[0.18, h, 0.36]} />
          {facet(hues[i % hues.length], 0.95)}
        </mesh>
      );
    })}
  </group>
);

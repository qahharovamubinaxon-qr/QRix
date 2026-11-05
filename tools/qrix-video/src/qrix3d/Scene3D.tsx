import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  Assistant,
  CodeGlyph,
  CYAN,
  Desk,
  Monitor,
  Mug,
  NAVY,
  ORANGE,
  PersonFromBehind,
  Shelf,
} from "./pieces";
import { Captions, Phrase } from "../qrix/Captions";
import { Bed, Cue } from "../qrix/Sound";
import { C, FONT, PAD } from "../qrix/theme";
import { ScreenClip } from "../qrix/ScreenClip";

export type Voice = {
  id: string;
  title: string;
  total: number;
  audio: string;
  phrases: Phrase[];
};

const FPS = 30;
const ease = Easing.bezier(0.33, 0, 0.3, 1);

/**
 * No @react-three/postprocessing.
 *
 * Its EffectComposer renders an empty frame in this headless pipeline —
 * first with the full chain, then with Bloom alone, so it is the composer
 * rather than any one effect. Rather than fight it, the glow is faked in 2D
 * over the canvas: a blurred, screen-blended copy of what was drawn. That is
 * what bloom is anyway, and it costs nothing at render time.
 */

/** Shot boundaries in seconds, pinned to the same voice track as the 2D cut. */
const SHOTS = {
  establish: [0, 6.838],
  assistant: [6.838, 11.394],
  screen: [11.394, 23.987],
  claim: [23.987, 28.621],
  logo: [28.621, 99],
} as const;

type Vec = [number, number, number];
const mix = (a: Vec, b: Vec, t: number): Vec =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * One camera, moved by hand.
 *
 * Cutting between several cameras in a single WebGL context is what the
 * Remotion three guidance warns about, and it is also what makes amateur 3D
 * look stitched together. Instead there is one camera that travels: it eases
 * between framings on the shot boundaries and keeps drifting inside each one,
 * so the picture is never still — which is the thing the first, flat cut was
 * missing more than any amount of detail.
 */
const Rig: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Framings are chosen against the actual object positions in pieces.tsx.
  // The first attempt put the camera at z=2.9 with the chair back at z=2.87,
  // so it rendered from inside the furniture and the frame came back as one
  // dark mass.
  const legs: { at: number; pos: Vec; look: Vec }[] = [
    { at: SHOTS.establish[0], pos: [2.0, 2.3, 7.6], look: [0, 1.0, 0.6] },
    { at: SHOTS.assistant[0], pos: [2.45, 1.72, 4.25], look: [2.25, 1.5, 0.5] },
    { at: SHOTS.screen[0], pos: [0.0, 1.32, 2.15], look: [0, 1.28, -0.5] },
    { at: SHOTS.claim[0], pos: [-2.8, 2.4, 6.0], look: [0.4, 1.2, -0.2] },
    { at: SHOTS.logo[0], pos: [2.15, 1.55, 4.9], look: [2.25, 1.45, 0.5] },
  ];

  // Find the shot we are in, then ease in from the previous framing over the
  // first 0.9s of it and hold. The first attempt eased towards the *next*
  // framing as soon as a shot began, so the camera arrived at each setup
  // seconds before the line that belonged to it — at ten seconds it was
  // already pressed against the monitor.
  let i = 0;
  while (i < legs.length - 1 && t >= legs[i + 1].at) i += 1;
  const cur = legs[i];
  const prev = legs[Math.max(0, i - 1)];
  const k = interpolate(t - cur.at, [0, 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const pos = i === 0 ? cur.pos : mix(prev.pos, cur.pos, k);
  const look = i === 0 ? cur.look : mix(prev.look, cur.look, k);

  const drift = Math.sin(t * 0.55) * 0.07;
  const rise = Math.cos(t * 0.4) * 0.045;

  return (
    <CameraDriver
      position={[pos[0] + drift, pos[1] + rise, pos[2]]}
      target={look as Vec}
    />
  );
};

/**
 * Drives the canvas's own default camera rather than mounting a second one.
 * `makeDefault` belongs to drei's camera component, and swapping cameras
 * inside one WebGL context is the sort of thing that bites during a headless
 * render; moving the camera that already exists avoids the question.
 */
const CameraDriver: React.FC<{ position: Vec; target: Vec }> = ({ position, target }) => {
  const camera = useThree((s) => s.camera);
  React.useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(new THREE.Vector3(...target));
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const c = camera as THREE.PerspectiveCamera;
      c.fov = 38;
      c.near = 0.1;
      c.far = 80;
    }
    camera.updateProjectionMatrix();
  });
  return null;
};

/**
 * A still of the real tool on the monitor.
 *
 * `useOffthreadVideoTexture` returns null here — proven by swapping the
 * fallback colour to magenta and watching the monitor turn magenta — so the
 * screen carries a real frame of the recording instead of live footage, and
 * the cut leaves 3D entirely for the step that talks the viewer through the
 * tool. That is the stronger edit regardless: the reference does the same,
 * cutting from its 3D set to a full-frame interface shot and back.
 */
const ScreenTexture: React.FC<{ src: string; children: (m: THREE.Texture | null) => React.ReactNode }> = ({
  src,
  children,
}) => {
  const tex = useLoader(THREE.TextureLoader, src);
  if (tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  return <>{children(tex ?? null)}</>;
};

const World: React.FC<{ recSrc: string }> = ({ recSrc }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // The assistant arrives on its own line and stays; its mouth opens while the
  // voice is speaking, which is cheap and still reads as "it is talking".
  const enter = interpolate(t, [SHOTS.assistant[0], SHOTS.assistant[0] + 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const talking = t > SHOTS.assistant[0] + 0.3;
  const mouth = talking ? 0.16 + Math.abs(Math.sin(t * 11)) * 0.22 : 0.1;
  const blinkPhase = (t * 0.7) % 4;
  const blink = blinkPhase > 3.86 ? 0.12 : 1;

  return (
    <>
      <color attach="background" args={[NAVY]} />
      <fog attach="fog" args={[NAVY, 7, 20]} />

      <ambientLight intensity={0.1} color="#44536f" />
      {/* Warm key from the desk side, cold rim from behind — the reference's
          whole mood comes from this pairing plus bloom. */}
      <pointLight position={[2.6, 2.0, 2.2]} intensity={34} color="#ffa263" distance={11} decay={2} />
      <pointLight position={[-3.6, 2.2, -1.4]} intensity={40} color={CYAN} distance={13} decay={2} />
      <pointLight position={[0, 1.3, 0.6]} intensity={14} color="#bfe6ff" distance={5} decay={2} />

      <Desk />
      <Mug position={[1.75, 0.19, 0.5]} />
      <PersonFromBehind />
      <Shelf position={[-3.4, 1.7, -2.6]} />

      {/* The recording's first nine seconds are the page loading, so mapped
          one-to-one the monitor would sit blank through the entire opening.
          A negative Sequence offset runs the footage ten seconds ahead, which
          puts the tool on screen from the first frame and lands the crop on
          the monitor during the shot that talks about it. */}
      <ScreenTexture src={recSrc}>
        {(map) => <Monitor map={map} />}
      </ScreenTexture>

      <group scale={enter} position={[0, 0, 0]}>
        <Assistant
          position={[2.25, 1.5, 0.5]}
          scale={0.62}
          spin={t * 0.65}
          bob={Math.sin(t * 1.5) * 0.08}
          color={t > SHOTS.claim[0] ? ORANGE : CYAN}
          mouth={mouth}
          blink={blink}
        />
      </group>

      <CodeGlyph position={[-2.1, 2.5, -1.2]} scale={1.15} color={CYAN} rot={0.4} />
      <CodeGlyph position={[3.6, 2.45, -2.2]} scale={0.78} color={ORANGE} rot={-0.5} />

      {/* Floor catches the glow and gives the room a bottom. */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#070b16" roughness={1} />
      </mesh>
      <mesh position={[0, 1.4, -5.2]}>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial color="#080d1b" roughness={1} />
      </mesh>


    </>
  );
};

/** Flat overlays: the number, the claim, the wordmark — text belongs in 2D. */
const Overlays: React.FC<{ voice: Voice }> = ({ voice }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const show = (a: number, b: number) =>
    interpolate(t, [a, a + 0.4, b - 0.35, b], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, backgroundColor: ORANGE }} />
      <div style={{ position: "absolute", top: 62, left: PAD, fontFamily: FONT, fontSize: 40, fontWeight: 800, letterSpacing: 7, color: ORANGE }}>
        QRIX
      </div>
      <div style={{ position: "absolute", top: 70, right: PAD, fontFamily: FONT, fontSize: 30, color: C.muted }}>
        qrixtools.com
      </div>

      <div
        style={{
          position: "absolute", left: PAD, right: PAD, top: 250, textAlign: "center",
          opacity: show(1.5, 6.6),
          scale: String(interpolate(t, [1.5, 2.1], [0.86, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })),
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 150, fontWeight: 800, color: ORANGE, letterSpacing: -2 }}>
          413 × 531
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, color: C.muted, marginTop: 6 }}>
          35 × 45 мм · паспорт РФ
        </div>
      </div>

      <div
        style={{
          position: "absolute", left: PAD, right: PAD, top: 300,
          opacity: show(24.1, 28.5), fontFamily: FONT, fontSize: 92, fontWeight: 800,
          color: C.text, lineHeight: 1.1,
        }}
      >
        Обработка —<br />
        <span style={{ color: ORANGE }}>в браузере</span>
      </div>

      <div
        style={{
          position: "absolute", left: PAD, right: PAD, top: 170, textAlign: "center",
          opacity: show(28.8, voice.total + 1.0),
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 128, fontWeight: 800, color: ORANGE, letterSpacing: 4 }}>
          QRIX
        </div>
        <div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 700, color: C.text, marginTop: 22 }}>
          185 инструментов
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, color: C.muted, marginTop: 10 }}>
          бесплатно · без водяных знаков
        </div>
      </div>

      <Captions phrases={voice.phrases} />
    </AbsoluteFill>
  );
};

export const Scene3D: React.FC<{ voice: Voice; recSrc: string; recDir: string }> = ({
  voice,
  recSrc,
  recDir,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true }}>
        <Rig />
        <World recSrc={staticFile(recSrc)} />
      </ThreeCanvas>
      {/* Faked bloom: a blurred, screen-blended copy of the canvas beneath.
          Emissive surfaces are the brightest thing in frame, so they are what
          blooms, which is the behaviour the real effect would have given. */}
      <AbsoluteFill
        style={{
          backdropFilter: "blur(16px)",
          mixBlendMode: "screen",
          opacity: 0.22,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 70% at 50% 42%, transparent 46%, rgba(4,7,16,0.72) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* The walkthrough leaves the set. One ThreeCanvas stays mounted —
          mounting a second one in the same context is the failure the
          Remotion three guidance warns about — and the live footage simply
          covers it while the steps are being explained. */}
      <Sequence
        from={Math.round(SHOTS.screen[0] * FPS)}
        durationInFrames={Math.round((SHOTS.screen[1] - SHOTS.screen[0]) * FPS)}
      >
        <ScreenClip
          src={`${recDir}/screen.mp4`}
          from={10.6}
          to={22.6}
          fx={0.5}
          fy={0.5}
          zoom={1.0}
          zoomTo={1.08}
          durationInFrames={Math.round((SHOTS.screen[1] - SHOTS.screen[0]) * FPS)}
        />
      </Sequence>

      <Overlays voice={voice} />
      <Cue at={1.64} file="pop.wav" volume={0.5} />
      <Cue at={6.9} file="whoosh.wav" volume={0.5} />
      <Cue at={22.6} file="click.wav" volume={0.7} />
      <Bed total={voice.total + 1.1} />
      <Audio src={staticFile(voice.audio)} volume={1} />
    </AbsoluteFill>
  );
};

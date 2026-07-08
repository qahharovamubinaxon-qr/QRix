"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { FiDownload, FiX, FiRotateCcw, FiZap, FiClock, FiStar } from "react-icons/fi";
import { AiDropzone, AiProcessing } from "@/components/ai/AiKit";
import { logJob } from "@/lib/user-prefs";
import { toast } from "@/lib/toast";

/* Image → 3D. Cloud path: AI Provider Manager (fal/replicate…) returns a GLB.
   Local path (no provider): instant on-device textured relief built from the
   image — full viewer + all four exports still work. */

type Quota = { freeLimit: number; freeUsed: number; creditCost: number; balance: number };
type Job = { id: string; status: string; progress: number; output?: { imageUrl?: string; status?: string } };

const LIGHTS: Record<string, { amb: number; key: string; keyI: number; fill: string }> = {
  "Studio HDR": { amb: 0.55, key: "#ffffff", keyI: 2.2, fill: "#bba9ff" },
  "Sunset": { amb: 0.35, key: "#ffb36b", keyI: 2.6, fill: "#7f5bd6" },
  "Neon": { amb: 0.3, key: "#e1ff04", keyI: 2.0, fill: "#22d3ee" },
};

/** On-device mesh: image as displaced, textured relief. */
function ReliefMesh({ src }: { src: string }) {
  const tex = useLoader(THREE.TextureLoader, src);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2, 2, 96, 96);
    // Displace vertices by luminance so the preview is genuinely 3D.
    const canvas = document.createElement("canvas");
    const img = tex.image as HTMLImageElement;
    const w = (canvas.width = 96), h = (canvas.height = 96);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = i % 97, y = Math.floor(i / 97);
      const pi = (Math.min(y, h - 1) * w + Math.min(x, w - 1)) * 4;
      const lum = (px[pi] + px[pi + 1] + px[pi + 2]) / (3 * 255);
      pos.setZ(i, lum * 0.5);
    }
    g.computeVertexNormals();
    return g;
  }, [tex]);
  const aspect = (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height || 1;
  return (
    <mesh geometry={geo} scale={[aspect > 1 ? 1 : aspect, aspect > 1 ? 1 / aspect : 1, 1]} name="qrix-model">
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function CloudMesh({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} name="qrix-model" />;
}

export default function ImageTo3DClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("model");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "queued" | "done">("idle");
  const [light, setLight] = useState("Studio HDR");
  const [eta, setEta] = useState(0);
  const [needCredits, setNeedCredits] = useState<{ required: number; balance: number } | null>(null);
  const sceneRef = useRef<THREE.Group>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/v1/3d").then((r) => r.json()).then((j) => {
      if (j.ok) { setQuota(j.data); setAuthed(true); } else setAuthed(false);
    }).catch(() => setAuthed(false));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const onFile = useCallback((f: File) => {
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(String(reader.result)); setMeshUrl(null); setMode("idle"); setNeedCredits(null); };
    setFileName(f.name.replace(/\.[^.]+$/, "") || "model");
    reader.readAsDataURL(f);
  }, []);

  const cancel = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (job?.id) await fetch(`/api/v1/jobs/${job.id}`, { method: "DELETE" }).catch(() => {});
    setMode("idle"); setJob(null); setEta(0);
  }, [job]);

  const generate = useCallback(async () => {
    if (!imageUrl) return;
    setNeedCredits(null);
    // Guests: instant on-device preview (cloud generation needs an account).
    if (!authed) { setMode("done"); setMeshUrl(null); toast.success("On-device 3D preview ready — sign in for AI generation"); return; }

    setMode("queued"); setEta(18);
    const r = await fetch("/api/v1/3d", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: imageUrl, name: fileName }) });
    const j = await r.json().catch(() => null);
    if (!j?.ok || j.data?.error === "insufficient_credits") {
      setMode("idle");
      if (j?.data?.error === "insufficient_credits") setNeedCredits({ required: j.data.required, balance: j.data.balance });
      else toast.error("Generation failed to start");
      return;
    }
    const created: Job = j.data.job;
    setJob(created);
    const t0 = Date.now();
    pollRef.current = setInterval(async () => {
      setEta((e) => Math.max(1, e - 1));
      const s = await fetch(`/api/v1/jobs/${created.id}`).then((x) => x.json()).catch(() => null);
      const jb: Job | undefined = s?.data;
      if (!jb) return;
      setJob(jb);
      if (["DONE", "FAILED", "CANCELED"].includes(jb.status)) {
        if (pollRef.current) clearInterval(pollRef.current);
        setEta(0);
        if (jb.status === "DONE") {
          const url = jb.output?.imageUrl;
          setMeshUrl(url && /^https?:/.test(url) ? url : null); // cloud GLB or on-device fallback
          setMode("done");
          logJob({ tool: "Image to 3D", file: `${fileName}.glb`, href: "/3d-tools/image-to-3d", status: "done" });
          toast.success(`3D model ready in ${Math.round((Date.now() - t0) / 1000)}s`);
          fetch("/api/v1/3d").then((r) => r.json()).then((x) => x.ok && setQuota(x.data)).catch(() => {});
        } else if (jb.status === "FAILED") {
          setMode("done"); setMeshUrl(null); // provider failed → on-device preview
          toast.error("Cloud engine unavailable — showing on-device 3D preview");
        } else setMode("idle");
      }
    }, 1000);
  }, [imageUrl, fileName, authed]);

  /** Export the current scene in any of the 4 formats (works for both paths). */
  const exportAs = useCallback(async (fmt: "glb" | "obj" | "stl" | "usdz") => {
    const group = sceneRef.current;
    if (!group) return;
    try {
      let blob: Blob;
      if (fmt === "glb") {
        const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
        const buf = await new Promise<ArrayBuffer>((res, rej) => new GLTFExporter().parse(group, (r) => res(r as ArrayBuffer), rej, { binary: true }));
        blob = new Blob([buf], { type: "model/gltf-binary" });
      } else if (fmt === "obj") {
        const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
        blob = new Blob([new OBJExporter().parse(group)], { type: "text/plain" });
      } else if (fmt === "stl") {
        const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
        blob = new Blob([new STLExporter().parse(group, { binary: true }) as unknown as ArrayBuffer], { type: "model/stl" });
      } else {
        const { USDZExporter } = await import("three/examples/jsm/exporters/USDZExporter.js");
        blob = new Blob([await new USDZExporter().parseAsync(group)], { type: "model/vnd.usdz+zip" });
      }
      const { saveBlob } = await import("@/lib/save-file");
      await saveBlob(blob, `${fileName}.${fmt}`);
    } catch {
      toast.error(`${fmt.toUpperCase()} export failed`);
    }
  }, [fileName]);

  const L = LIGHTS[light];
  const freeLeft = quota ? Math.max(0, quota.freeLimit - quota.freeUsed) : null;

  return (
    <div>
      {/* Quota strip */}
      <div className="flex items-center gap-2 flex-wrap mb-4 text-[12px]">
        {authed === false && <span className="px-2.5 py-1 rounded-lg font-bold" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>Guest — on-device preview · <a href="/login" className="underline" style={{ color: "var(--primary-bright)" }}>sign in</a> for AI generation</span>}
        {quota && (
          <>
            <span className="px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1.5" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e" }}>
              <FiStar size={11} /> {freeLeft} free generation{freeLeft === 1 ? "" : "s"} left
            </span>
            <span className="px-2.5 py-1 rounded-lg font-bold" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              then {quota.creditCost} credits each · balance {quota.balance}
            </span>
          </>
        )}
      </div>

      {!imageUrl && <AiDropzone onFile={onFile} hint="One clear photo of an object — PNG or JPG, centred, plain background" />}

      {imageUrl && mode === "idle" && (
        <div className="grid md:grid-cols-[280px_1fr] gap-4 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Source" className="rounded-xl w-full" style={{ border: "1px solid var(--border)" }} />
          <div className="qx-card p-5">
            <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>Ready to generate a 3D model from <b style={{ color: "var(--text)" }}>{fileName}</b>.</p>
            {needCredits && (
              <p className="text-[13px] font-bold mb-3 p-3 rounded-xl" style={{ background: "rgba(248,113,113,.1)", color: "#f87171" }}>
                Needs {needCredits.required} credits — you have {needCredits.balance}. <a href="/pricing" className="underline">Get more</a>
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <button onClick={generate} className="qx-btn !py-2.5 !px-5 text-[13px] font-bold inline-flex items-center gap-2"><FiZap size={14} /> Generate 3D model</button>
              <button onClick={() => setImageUrl(null)} className="qx-btn-ghost !py-2.5 !px-4 text-[13px] font-bold">Change image</button>
            </div>
          </div>
        </div>
      )}

      {mode === "queued" && (
        <div className="qx-card p-8 text-center">
          <AiProcessing label={`Generating 3D model… ${job?.status === "PROCESSING" ? "meshing" : "queued"}`} />
          <div className="max-w-xs mx-auto mt-4 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(8, job?.progress ?? 5)}%`, background: "var(--grad-primary)" }} />
          </div>
          <p className="text-[12px] mt-3 inline-flex items-center gap-1.5" style={{ color: "var(--text-faint)" }}><FiClock size={12} /> ~{eta}s remaining</p>
          <div className="mt-4">
            <button onClick={cancel} className="qx-btn-ghost !py-2 !px-4 text-[12px] font-bold inline-flex items-center gap-1.5"><FiX size={13} /> Cancel</button>
          </div>
        </div>
      )}

      {mode === "done" && imageUrl && (
        <div>
          <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", height: 420, background: "radial-gradient(ellipse at 50% 30%, #14142a, #07070f)" }}>
            <Canvas camera={{ position: [0, 0.4, 2.6], fov: 45 }} dpr={[1, 2]}>
              <ambientLight intensity={L.amb} />
              <directionalLight position={[3, 4, 2]} intensity={L.keyI} color={L.key} />
              <pointLight position={[-3, -1, -2]} intensity={1.1} color={L.fill} />
              <Suspense fallback={null}>
                <Center>
                  <group ref={sceneRef}>
                    {meshUrl ? <CloudMesh url={meshUrl} /> : <ReliefMesh src={imageUrl} />}
                  </group>
                </Center>
              </Suspense>
              <OrbitControls enableDamping makeDefault />
            </Canvas>
            {authed !== null && quota === null && null}
            {(!quota || freeLeft !== null) && (
              <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none"
                style={{ background: "rgba(0,0,0,.45)", color: "rgba(255,255,255,.65)" }}>
                {meshUrl ? "AI mesh" : "On-device preview"} · QRix
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            <select value={light} onChange={(e) => setLight(e.target.value)} aria-label="Lighting"
              className="px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
              {Object.keys(LIGHTS).map((k) => <option key={k}>{k}</option>)}
            </select>
            <span className="flex-1" />
            {(["glb", "obj", "stl", "usdz"] as const).map((f) => (
              <button key={f} onClick={() => exportAs(f)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold uppercase"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <FiDownload size={12} /> {f}
              </button>
            ))}
            <button onClick={() => { setImageUrl(null); setMode("idle"); setMeshUrl(null); }}
              className="qx-btn-ghost !py-2 !px-3 text-[12px] font-bold inline-flex items-center gap-1.5"><FiRotateCcw size={12} /> New</button>
          </div>
        </div>
      )}
    </div>
  );
}

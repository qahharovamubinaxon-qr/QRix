"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  FiDownload, FiX, FiRotateCcw, FiZap, FiClock, FiStar, FiUpload,
  FiGrid, FiRefreshCw, FiChevronDown, FiBox, FiImage,
} from "react-icons/fi";
import { logJob } from "@/lib/user-prefs";
import { toast } from "@/lib/toast";

/* Image → 3D STUDIO (Design V2). Tripo-class workspace: left generation panel,
   center viewer with real lighting (PMREM room environment + ACES tone mapping,
   contact shadows, topology stats), right asset history, environment swatches.
   Cloud path: AI Provider Manager returns a GLB. Local path: HD displaced
   relief with smoothing + alpha cutout — all four exports always work. */

type Quota = { freeLimit: number; freeUsed: number; creditCost: number; balance: number; history?: HistoryJob[] };
type HistoryJob = { id: string; status: string; createdAt: string; input?: { name?: string }; output?: { imageUrl?: string } };
type Job = { id: string; status: string; progress: number; output?: { imageUrl?: string; status?: string } };

const ENVS = [
  { id: "void", dot: "#1a1a2e", bg: "radial-gradient(ellipse at 50% 30%, #16162c, #060610)" },
  { id: "studio", dot: "#e8e8f0", bg: "radial-gradient(ellipse at 50% 30%, #3a3a4a, #16161f)" },
  { id: "violet", dot: "#7c5cff", bg: "radial-gradient(ellipse at 50% 30%, #2b2150, #0a0716)" },
  { id: "gold", dot: "#f59e0b", bg: "radial-gradient(ellipse at 50% 30%, #3a2c14, #120c05)" },
  { id: "teal", dot: "#2dd4bf", bg: "radial-gradient(ellipse at 50% 30%, #0f3733, #050f0e)" },
];

/** HD on-device mesh: smoothed luminance heightfield with alpha cutout. */
function ReliefMesh({ src, hd, depth, onStats }: { src: string; hd: boolean; depth: number; onStats: (f: number, v: number) => void }) {
  const tex = useLoader(THREE.TextureLoader, src);
  const geo = useMemo(() => {
    const seg = hd ? 220 : 120;
    const g = new THREE.PlaneGeometry(2, 2, seg, seg);
    const canvas = document.createElement("canvas");
    const img = tex.image as HTMLImageElement;
    const w = (canvas.width = seg + 1), h = (canvas.height = seg + 1);
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.filter = "blur(1.2px)"; // pre-smooth so the surface reads as sculpted, not noisy
    ctx.drawImage(img, 0, 0, w, h);
    const px = ctx.getImageData(0, 0, w, h).data;

    // Perceptual luminance, normalised to the full range for strong relief.
    const lum = new Float32Array(w * h);
    let mn = 1, mx = 0;
    for (let i = 0; i < w * h; i++) {
      const a = px[i * 4 + 3] / 255;
      const l = a < 0.15 ? 0 : (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      lum[i] = l * a;
      if (lum[i] < mn) mn = lum[i];
      if (lum[i] > mx) mx = lum[i];
    }
    const range = Math.max(0.001, mx - mn);
    // One smoothing pass (box blur) to kill spikes.
    const sm = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < h && xx >= 0 && xx < w) { s += lum[yy * w + xx]; n++; }
      }
      sm[y * w + x] = s / n;
    }
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = i % (seg + 1), y = Math.floor(i / (seg + 1));
      pos.setZ(i, ((sm[y * w + x] - mn) / range) * depth);
    }
    g.computeVertexNormals();
    onStats(seg * seg * 2, pos.count);
    return g;
  }, [tex, hd, depth, onStats]);

  const aspect = (tex.image as HTMLImageElement).width / (tex.image as HTMLImageElement).height || 1;
  return (
    <mesh geometry={geo} scale={[aspect > 1 ? 1 : aspect, aspect > 1 ? 1 / aspect : 1, 1]} name="qrix-model" castShadow>
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.45} metalness={0.15}
        transparent alphaTest={0.12} envMapIntensity={0.9} />
    </mesh>
  );
}

function CloudMesh({ url, onStats }: { url: string; onStats: (f: number, v: number) => void }) {
  const { scene } = useGLTF(url);
  useEffect(() => {
    let f = 0, v = 0;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry) {
        v += m.geometry.attributes.position?.count ?? 0;
        f += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position?.count ?? 0) / 3;
      }
    });
    onStats(Math.round(f), v);
  }, [scene, onStats]);
  return <primitive object={scene} name="qrix-model" />;
}

/** Studio-grade lighting: procedural PMREM room env + ACES — no network. */
async function applyStudioLighting(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
}

export default function ImageTo3DClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("model");
  const [quota, setQuota] = useState<Quota | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [eta, setEta] = useState(0);
  const [needCredits, setNeedCredits] = useState<{ required: number; balance: number } | null>(null);
  // studio settings
  const [hd, setHd] = useState(true);
  const [depth, setDepth] = useState(0.5);
  const [env, setEnv] = useState(ENVS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [grid, setGrid] = useState(false);
  const [stats, setStats] = useState<{ f: number; v: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const sceneRef = useRef<THREE.Group>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshQuota = useCallback(() => {
    fetch("/api/v1/3d").then((r) => r.json()).then((j) => {
      if (j.ok) { setQuota(j.data); setAuthed(true); } else setAuthed(false);
    }).catch(() => setAuthed(false));
  }, []);
  useEffect(() => { refreshQuota(); return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, [refreshQuota]);

  const onFile = useCallback((f: File) => {
    if (!/^image\//.test(f.type)) { toast.error("Upload a PNG, JPG or WEBP image"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(String(reader.result)); setMeshUrl(null); setNeedCredits(null); setStats(null); };
    setFileName(f.name.replace(/\.[^.]+$/, "") || "model");
    reader.readAsDataURL(f);
  }, []);

  const cancel = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (job?.id) await fetch(`/api/v1/jobs/${job.id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false); setJob(null); setEta(0);
  }, [job]);

  const generate = useCallback(async () => {
    if (!imageUrl || busy) return;
    setNeedCredits(null);
    if (!authed) { setMeshUrl(null); toast.success("On-device 3D ready — sign in for AI generation"); return; }

    setBusy(true); setEta(18);
    const r = await fetch("/api/v1/3d", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: imageUrl, name: fileName }) });
    const j = await r.json().catch(() => null);

    // No 3D provider configured — say so plainly instead of queueing a job that is
    // certain to fail. Nothing is charged; the on-device relief stays on screen.
    if (j?.ok && j.data?.error === "engine_not_configured") {
      setBusy(false);
      setMeshUrl(null);
      toast.error("AI 3D engine isn't connected — showing the on-device relief instead");
      return;
    }

    if (!j?.ok || j.data?.error === "insufficient_credits") {
      setBusy(false);
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
        setBusy(false); setEta(0);
        if (jb.status === "DONE") {
          const url = jb.output?.imageUrl;
          setMeshUrl(url && /^https?:/.test(url) ? url : null);
          logJob({ tool: "Image to 3D", file: `${fileName}.glb`, href: "/3d-tools/image-to-3d", status: "done" });
          toast.success(`3D model ready in ${Math.round((Date.now() - t0) / 1000)}s`);
          refreshQuota();
        } else if (jb.status === "FAILED") {
          setMeshUrl(null);
          toast.error("Cloud engine unavailable — showing HD on-device mesh");
        }
      }
    }, 1000);
  }, [imageUrl, fileName, authed, busy, refreshQuota]);

  const exportAs = useCallback(async (fmt: "glb" | "obj" | "stl" | "usdz") => {
    const group = sceneRef.current;
    if (!group) return;
    setExportOpen(false);
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

  const onStats = useCallback((f: number, v: number) => setStats({ f, v }), []);
  const freeLeft = quota ? Math.max(0, quota.freeLimit - quota.freeUsed) : null;
  const history = (quota?.history ?? []).slice(0, 8);
  const panelBtn = { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-glass)", background: "var(--surface-solid)" }}>
      <div className="grid lg:grid-cols-[250px_1fr_168px]">

        {/* ══ LEFT — generation panel ══ */}
        <aside className="p-4 space-y-4" style={{ borderRight: "1px solid var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Generate model</p>

          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl p-4 text-center transition-colors"
            style={{ border: "1.5px dashed var(--border-glass)", background: "var(--surface)", minHeight: 130 }}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Source" className="max-h-28 mx-auto rounded-lg" />
            ) : (
              <span className="block" style={{ color: "var(--text-muted)" }}>
                <FiUpload className="mx-auto mb-2" size={18} />
                <span className="text-[12px] font-semibold">Upload image</span>
                <span className="block text-[10px] mt-1" style={{ color: "var(--text-faint)" }}>JPG · PNG · WEBP, ≤ 6MB</span>
              </span>
            )}
          </button>

          {/* quality settings */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-[12px] font-semibold" style={{ color: "var(--text)" }}>
              HD mesh <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>2×</span>
              <button role="switch" aria-checked={hd} onClick={() => setHd(!hd)}
                className="relative w-10 h-5.5 rounded-full transition-colors" style={{ height: 22, background: hd ? "var(--grad-primary)" : "var(--surface-2)", border: "1px solid var(--border)" }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: 3, transform: hd ? "translateX(17px)" : "none" }} />
              </button>
            </label>
            <label className="block text-[12px] font-semibold" style={{ color: "var(--text)" }}>
              Depth <span className="float-right" style={{ color: "var(--text-faint)" }}>{Math.round(depth * 100)}%</span>
              <input type="range" min={0.15} max={1} step={0.05} value={depth} onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full mt-1 accent-[#e1ff04]" aria-label="Relief depth" />
            </label>
          </div>

          {/* quota */}
          {authed === false && (
            <p className="text-[11px] p-2.5 rounded-xl" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              Guest — on-device studio. <a href="/login" className="underline font-bold" style={{ color: "var(--primary-bright)" }}>Sign in</a> for AI generation.
            </p>
          )}
          {quota && (
            <p className="text-[11px] p-2.5 rounded-xl inline-flex items-center gap-1.5 w-full" style={{ background: "rgba(34,197,94,.1)", color: "#22c55e" }}>
              <FiStar size={11} /> {freeLeft} free left · then {quota.creditCost} cr · balance {quota.balance}
            </p>
          )}
          {needCredits && (
            <p className="text-[11px] p-2.5 rounded-xl font-bold" style={{ background: "rgba(248,113,113,.1)", color: "#f87171" }}>
              Needs {needCredits.required} credits (you have {needCredits.balance}). <a href="/pricing" className="underline">Get more</a>
            </p>
          )}

          {/* generate */}
          {busy ? (
            <div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(8, job?.progress ?? 5)}%`, background: "var(--grad-primary)" }} />
              </div>
              <p className="text-[11px] mt-2 inline-flex items-center gap-1" style={{ color: "var(--text-faint)" }}>
                <FiClock size={11} /> {job?.status === "PROCESSING" ? "Meshing" : "Queued"} · ~{eta}s
              </p>
              <button onClick={cancel} className="w-full mt-2 qx-btn-ghost !py-2 text-[12px] font-bold inline-flex items-center justify-center gap-1.5">
                <FiX size={12} /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={generate} disabled={!imageUrl}
              className="qx-btn-hero w-full !py-3 text-[13px] font-bold justify-center inline-flex items-center gap-2 disabled:opacity-40">
              <FiZap size={14} /> Generate model
              {authed && quota && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,.18)" }}>
                  {freeLeft ? "FREE" : `🪙 ${quota.creditCost}`}
                </span>
              )}
            </button>
          )}
        </aside>

        {/* ══ CENTER — viewer ══ */}
        <div className="relative" style={{ minHeight: 520, background: env.bg }}>
          {imageUrl ? (
            <>
              <Canvas key={env.id} camera={{ position: [0, 0.5, 2.7], fov: 42 }} dpr={[1, 2]} shadows
                onCreated={({ gl, scene }) => { void applyStudioLighting(gl, scene); }}>
                <ambientLight intensity={0.25} />
                <directionalLight position={[3, 5, 2]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
                <Suspense fallback={null}>
                  <Center top>
                    <group ref={sceneRef}>
                      {meshUrl
                        ? <CloudMesh url={meshUrl} onStats={onStats} />
                        : <ReliefMesh src={imageUrl} hd={hd} depth={depth} onStats={onStats} />}
                    </group>
                  </Center>
                  <ContactShadows position={[0, -0.02, 0]} opacity={0.55} scale={6} blur={2.4} far={2.5} />
                </Suspense>
                {grid && <gridHelper args={[8, 32, "#3a3a55", "#22223a"]} position={[0, -0.01, 0]} />}
                <OrbitControls enableDamping makeDefault autoRotate={autoRotate} autoRotateSpeed={1.1} minDistance={1.2} maxDistance={6} />
              </Canvas>

              {/* topology stats — Tripo-style readout */}
              <div className="absolute top-3 right-3 text-right text-[10.5px] leading-relaxed px-3 py-2 rounded-xl pointer-events-none"
                style={{ background: "rgba(5,5,12,.55)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,.75)" }}>
                <div>Topology <b style={{ color: "#fff" }}>Triangle</b></div>
                <div>Faces <b style={{ color: "#fff" }}>{(stats?.f ?? 0).toLocaleString()}</b></div>
                <div>Vertices <b style={{ color: "#fff" }}>{(stats?.v ?? 0).toLocaleString()}</b></div>
              </div>
              <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none"
                style={{ background: "rgba(5,5,12,.55)", color: "rgba(255,255,255,.6)" }}>
                {meshUrl ? "AI MESH" : hd ? "HD RELIEF" : "RELIEF"} · QRix Studio
              </span>

              {/* bottom toolbar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl"
                style={{ background: "rgba(5,5,12,.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.08)" }}>
                {ENVS.map((e) => (
                  <button key={e.id} onClick={() => setEnv(e)} title={`Environment: ${e.id}`} aria-label={`Environment ${e.id}`}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ background: e.dot, outline: env.id === e.id ? "2px solid #e1ff04" : "1px solid rgba(255,255,255,.2)", outlineOffset: 2 }} />
                ))}
                <span className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,.12)" }} />
                <button onClick={() => setAutoRotate(!autoRotate)} title="Auto-rotate" className="p-1.5 rounded-lg"
                  style={{ color: autoRotate ? "#e1ff04" : "rgba(255,255,255,.55)" }}><FiRefreshCw size={14} /></button>
                <button onClick={() => setGrid(!grid)} title="Grid" className="p-1.5 rounded-lg"
                  style={{ color: grid ? "#e1ff04" : "rgba(255,255,255,.55)" }}><FiGrid size={14} /></button>
                <button onClick={() => { setImageUrl(null); setMeshUrl(null); setStats(null); }} title="New model" className="p-1.5 rounded-lg"
                  style={{ color: "rgba(255,255,255,.55)" }}><FiRotateCcw size={14} /></button>
                <span className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,.12)" }} />
                <div className="relative">
                  <button onClick={() => setExportOpen(!exportOpen)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold"
                    style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
                    <FiDownload size={13} /> Export <FiChevronDown size={11} />
                  </button>
                  {exportOpen && (
                    <div className="absolute bottom-full mb-2 right-0 rounded-xl overflow-hidden min-w-[130px]"
                      style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--el-3)" }}>
                      {(["glb", "obj", "stl", "usdz"] as const).map((f) => (
                        <button key={f} onClick={() => exportAs(f)}
                          className="w-full px-4 py-2.5 text-left text-[12px] font-bold uppercase hover:opacity-80"
                          style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}>
                          {f} {f === "stl" && <span className="normal-case font-normal" style={{ color: "var(--text-faint)" }}>· 3D print</span>}
                          {f === "usdz" && <span className="normal-case font-normal" style={{ color: "var(--text-faint)" }}>· AR</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center px-6">
              <div>
                <FiBox size={40} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,.25)" }} />
                <p className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,.7)" }}>Your 3D workspace</p>
                <p className="text-[12px] mt-1 max-w-[260px]" style={{ color: "rgba(255,255,255,.4)" }}>
                  Upload one photo on the left — orbit, relight and export GLB / OBJ / STL / USDZ right here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT — assets ══ */}
        <aside className="p-3 hidden lg:block" style={{ borderLeft: "1px solid var(--border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-faint)" }}>Assets</p>
          {history.length === 0 && (
            <p className="text-[11px] px-1" style={{ color: "var(--text-faint)" }}>Generated models appear here.</p>
          )}
          <div className="space-y-2">
            {history.map((hjob) => {
              const cloud = hjob.output?.imageUrl && /^https?:/.test(hjob.output.imageUrl);
              return (
                <button key={hjob.id}
                  onClick={() => { if (cloud) { setMeshUrl(hjob.output!.imageUrl!); if (!imageUrl) setImageUrl("data:,"); } }}
                  className="w-full rounded-xl p-2.5 text-left transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: cloud ? "pointer" : "default" }}>
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--surface-2)" }}>
                      {cloud ? <FiBox size={14} style={{ color: "var(--cat-3d)" }} /> : <FiImage size={14} style={{ color: "var(--text-faint)" }} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold truncate" style={{ color: "var(--text)" }}>{hjob.input?.name || "model"}</span>
                      <span className="block text-[9.5px]" style={{ color: hjob.status === "DONE" ? "#22c55e" : hjob.status === "FAILED" ? "#f87171" : "var(--text-faint)" }}>
                        {hjob.status.toLowerCase()} · {hjob.createdAt.slice(5, 10)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {history.length > 0 && (
            <button onClick={refreshQuota} className="w-full mt-3 text-[10.5px] font-bold py-1.5 rounded-lg" style={panelBtn}>
              Refresh
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

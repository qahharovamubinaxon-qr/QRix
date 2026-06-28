"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   QRix — Guard Companion (3D GLB: /mascots-3d/guard.glb).
   - Сайт бурчагида туради; курсор тарафига учиб боради.
   - Курсорга қарайди (бош/тана бурилади).
   - GLB ичидаги анимациялар (idle ва ҳ.к.) ижро этилади.
   - Курсор нимага борса — ўша ҳақида маълумот беради.
   - Тема ёруғлиги: тунги → қизил неон, кундузги → яшил.
   - Карта/тугмаларни тўсмайди (pointer-events: none).
   - Барча саҳифада ишлайди (layout'да).
   ============================================================ */

const PANEL_W = 210;
const PANEL_H = 320;
const MARGIN = 14;

/* ===== ОСОН СОЗЛАШ (шу сонларни ўзгартиринг) ===== */
const Y_OFFSET = 1.3;     // 🔽 пастга тушириш: сонни оширинг (0.3, 0.6, 1.0 ...). Юқорига: манфий (-0.3)
const BASE_YAW_DEG = 270;   // 🔄 олдига қаратиш: 90, -90 ёки 180 ни синаб кўринг (даража)
const QR_SIZE = 0.50;     // 🔳 QR катталиги (0.4 кичик ... 0.9 катта)
const QR_UP = 0.42;       // ↕️ QR баландлиги (юзга мослаш: оширсангиз тепага)
const QR_FWD = 0.20;      // ➡️ QR юздан олдинга масофа (ичига кириб кетса оширинг)
/* ================================================ */

function describe(target: EventTarget | null): string {
  if (!(target instanceof Element)) return "";
  const custom = target.closest("[data-pet-info]");
  if (custom) return custom.getAttribute("data-pet-info") || "";
  const card = target.closest(".qx-mqcard");
  if (card) {
    const l = card.querySelector(".qx-mqcard-label")?.textContent?.trim();
    const d = card.querySelector(".qx-mqcard-desc")?.textContent?.trim();
    if (l) return d ? `${l} — ${d}` : l;
  }
  const aria = target.closest("[aria-label]")?.getAttribute("aria-label");
  if (aria) return aria.trim();
  const title = target.closest("[title]")?.getAttribute("title");
  if (title) return title.trim();
  const btn = target.closest("button, a");
  if (btn) {
    const txt = (btn.textContent || "").replace(/\s+/g, " ").trim();
    if (txt && txt.length <= 64) return txt;
  }
  return "";
}

export default function Mascots3D({ src = "/mascots-3d/guard.glb" }: { src?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState("");
  const [side, setSide] = useState<"left" | "right">("right");

  const audioRef = useRef<AudioContext | null>(null);
  const blip = useCallback(() => {
    if (!audioRef.current) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new Ctx();
      } catch { return; }
    }
    const ctx = audioRef.current!;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 780; g.gain.value = 0.03;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.start(t); o.stop(t + 0.09);
  }, []);

  // бурчак тарафи (гистерезис)
  useEffect(() => {
    let cur: "left" | "right" = "right";
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      if (e.clientX < w * 0.4 && cur !== "left") { cur = "left"; setSide("left"); }
      else if (e.clientX > w * 0.6 && cur !== "right") { cur = "right"; setSide("right"); }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const place = () => {
      const x = side === "left" ? MARGIN : window.innerWidth - PANEL_W - MARGIN;
      wrap.style.transform = `translateX(${x}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [side]);

  // маълумот
  useEffect(() => {
    let last = "";
    let raf = 0;
    let pending: string | null = null;
    const onMove = (e: PointerEvent) => {
      pending = describe(e.target);
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          const info = pending || "";
          if (info !== last) { last = info; setBubble(info); if (info) blip(); }
        });
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true, capture: true });
    return () => { document.removeEventListener("pointermove", onMove, true); if (raf) cancelAnimationFrame(raf); };
  }, [blip]);

  // ===== 3D модель =====
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (disposed) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, PANEL_W / PANEL_H, 0.1, 100);
      camera.position.set(0, 0.3, 5);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(PANEL_W, PANEL_H);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const isLight = () => document.documentElement.classList.contains("light");
      const rimHex = () => (isLight() ? 0x34d399 : 0xff2a4d);

      scene.add(new THREE.AmbientLight(0xffffff, 1.05));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(2, 4, 3);
      scene.add(key);
      const rim = new THREE.PointLight(rimHex(), 7, 16, 2);
      rim.position.set(-2, 1.5, 2);
      scene.add(rim);
      const rim2 = new THREE.PointLight(rimHex(), 4, 16, 2);
      rim2.position.set(2, 0.5, -2);
      scene.add(rim2);

      const root = new THREE.Group();
      scene.add(root);

      let mixer: THREE.AnimationMixer | null = null;
      let ready = false;
      let qrMesh: THREE.Mesh | null = null;
      let headObj: THREE.Object3D | null = null;
      const tmpA = new THREE.Vector3();
      const tmpB = new THREE.Vector3();
      const target = { y: 0, x: 0 };

      const loader = new GLTFLoader();
      loader.load(
        src,
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3(), center = new THREE.Vector3();
          box.getSize(size); box.getCenter(center);
          model.position.sub(center);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const TARGET = 2.0;                 // нормал ўлчам
          const s = TARGET / maxDim;
          model.scale.setScalar(s);
          model.position.y -= Y_OFFSET;       // 🔽 пастга/юқорига
          model.rotation.y = (BASE_YAW_DEG * Math.PI) / 180; // 🔄 олдига қаратиш
          root.add(model);

          // === камерани моделга мослаш (тўлиқ кўриниши учун) ===
          const sx = size.x * s, sy = size.y * s;
          const halfFov = (camera.fov * Math.PI) / 180 / 2;
          const distH = (sy / 2) / Math.tan(halfFov);
          const distW = (sx / 2) / (Math.tan(halfFov) * camera.aspect);
          const dist = Math.max(distH, distW) * 1.35 + 0.5;  // padding
          camera.position.set(0, 0, dist);
          camera.lookAt(0, 0, 0);
          if (gltf.animations?.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((c) => mixer!.clipAction(c).play());
          }

          // === ЮЗГА QR КОД ===
          headObj = model.getObjectByName("Head") || null;
          const tex = new THREE.TextureLoader().load("/mascots-3d/qr-face.png");
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          const qrMat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
          });
          qrMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), qrMat);
          qrMesh.renderOrder = 999;
          qrMesh.scale.setScalar(QR_SIZE);
          scene.add(qrMesh);

          ready = true;
        },
        undefined,
        (err) => console.warn("[Mascots3D] guard.glb юкланмади:", err)
      );

      const onMove = (e: PointerEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        target.y = nx * 0.6;
        target.x = ny * 0.18;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const clock = new THREE.Clock();
      let t = 0;
      const animate = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        t += dt;
        if (mixer) mixer.update(dt);
        if (ready) {
          root.rotation.y += (target.y - root.rotation.y) * 0.08;
          root.rotation.x += (target.x - root.rotation.x) * 0.08;
          if (!reduce) root.position.y = Math.sin(t * 1.5) * 0.04;

          // QR'ни юзга жойлаш — доим камерага қараб (ўқилади)
          if (qrMesh) {
            if (headObj) headObj.getWorldPosition(tmpA);
            else root.getWorldPosition(tmpA), (tmpA.y += 1.0);
            tmpA.y += QR_UP;
            tmpB.copy(camera.position).sub(tmpA).normalize().multiplyScalar(QR_FWD);
            qrMesh.position.copy(tmpA).add(tmpB);
            qrMesh.lookAt(camera.position);
          }
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      const applyTheme = () => { rim.color.setHex(rimHex()); rim2.color.setHex(rimHex()); };
      const obs = new MutationObserver(applyTheme);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      cleanup = () => {
        obs.disconnect();
        window.removeEventListener("pointermove", onMove);
        mixer?.stopAllAction();
        renderer.dispose();
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[] | undefined;
          if (mat) Array.isArray(mat) ? mat.forEach((x) => x.dispose()) : mat.dispose();
        });
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [src]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="qx-guard fixed bottom-3 left-0 z-[60] pointer-events-none"
      style={{ width: PANEL_W, height: PANEL_H, transition: "transform .8s cubic-bezier(.22,.9,.3,1.05)" }}
    >
      <div className="qx-guard-glow" />
      {bubble && <div className={`qx-guard-bubble ${side === "left" ? "is-left" : "is-right"}`}>{bubble}</div>}
      <div ref={mountRef} style={{ width: PANEL_W, height: PANEL_H, position: "relative", zIndex: 1 }} />

      <style>{`
        .qx-guard { --g-neon: #ff2a4d; }
        html.light .qx-guard { --g-neon: #34d399; }
        .qx-guard-glow {
          position: absolute; left: 50%; bottom: 12%;
          width: 70%; height: 45%;
          transform: translateX(-50%);
          background: radial-gradient(closest-side, color-mix(in srgb, var(--g-neon) 50%, transparent), transparent 75%);
          filter: blur(20px); opacity: .5; z-index: 0; pointer-events: none;
        }
        .qx-guard-bubble {
          position: absolute; top: 4px; z-index: 2;
          max-width: 200px; width: max-content;
          padding: 9px 13px; border-radius: 14px;
          font-size: 12.5px; font-weight: 600; line-height: 1.3;
          color: var(--text, #f2f2f7);
          background: var(--surface-solid, rgba(20,20,30,.96));
          border: 1px solid var(--g-neon);
          box-shadow: 0 8px 26px rgba(0,0,0,.4), 0 0 20px color-mix(in srgb, var(--g-neon) 45%, transparent);
          animation: gPop .22s cubic-bezier(.22,.9,.3,1.2);
        }
        .qx-guard-bubble.is-right { right: 8px; }
        .qx-guard-bubble.is-left  { left: 8px; }
        @keyframes gPop { from { opacity:0; transform: translateY(6px) scale(.92);} }
      `}</style>
    </div>
  );
}

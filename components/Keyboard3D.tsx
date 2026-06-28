"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ============================================================
   QRix 3D Keyboard — Mac Magic Keyboard услуби (тоза, реалистик).
   Тугмалар = функциялар (URL / WiFi / PDF ...).
   - Шаффоф фон (орқа фонни алоҳида қўясиз) + юмшоқ соя.
   - Тема: кундузги (.light) → оқ/кумуш клавиатура,
           тунги (dark)      → қора/графит клавиатура.
   - Неон акцент (hover/press): кундузги пурпле, тунги кўк-яшил.
   - Drag: айлантириш · Hover: тугма кўтарилади/ёришади.
   - Click: тугма отилиб чиқади (pop-out + fade) → саҳифага ўтиш.
   ============================================================ */

export type KeyItem = {
  href: string;
  label: string;
  desc: string;
  emoji: string;
  grad: string;
  badge?: string;
};

function firstHex(grad: string): string {
  const m = grad.match(/#[0-9a-fA-F]{3,8}/g);
  return m && m.length ? m[0] : "#6366f1";
}

// Mac услуб кейкап текстураси (тема: оқ ёки қора)
function makeKeycapTexture(item: KeyItem, light: boolean, dpr: number): HTMLCanvasElement {
  const W = 256, H = 256;
  const c = document.createElement("canvas");
  c.width = W * dpr; c.height = H * dpr;
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // фон — юмшоқ градиент (юқори ёруғроқ, Mac keycap ҳисси)
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (light) {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#e9e9ee");
  } else {
    g.addColorStop(0, "#34343d");
    g.addColorStop(1, "#24242b");
  }
  const r = 38;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(W, 0, W, H, r);
  ctx.arcTo(W, H, 0, H, r);
  ctx.arcTo(0, H, 0, 0, r);
  ctx.arcTo(0, 0, W, 0, r);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();

  // юқори ялтироқ чизиқ
  ctx.fillStyle = light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.10)";
  ctx.fillRect(14, 12, W - 28, 5);

  const textCol = light ? "#23232a" : "#f1f1f6";
  const subCol = light ? "rgba(60,60,70,0.6)" : "rgba(230,230,240,0.55)";

  // emoji
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "82px serif";
  ctx.fillText(item.emoji, W / 2, H * 0.37);

  // label
  ctx.fillStyle = textCol;
  ctx.font = "bold 34px sans-serif";
  ctx.fillText(item.label, W / 2, H * 0.66);

  // desc
  ctx.fillStyle = subCol;
  ctx.font = "21px sans-serif";
  ctx.fillText(item.desc, W / 2, H * 0.79);

  // пастда тугма рангли акцент чизиғи (функцияни ажратиш учун)
  const accent = firstHex(item.grad);
  ctx.fillStyle = accent;
  const bw = 64, bh = 7;
  ctx.beginPath();
  ctx.roundRect(W / 2 - bw / 2, H - 30, bw, bh, 4);
  ctx.fill();

  // badge
  if (item.badge) {
    ctx.fillStyle = accent;
    const w2 = 70, h2 = 32;
    ctx.beginPath();
    ctx.roundRect(W - w2 - 12, 12, w2, h2, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(item.badge, W - w2 / 2 - 12, 12 + h2 / 2);
  }

  return c;
}

export default function Keyboard3D({ keys, title }: { keys: KeyItem[]; title?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hint, setHint] = useState("");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (disposed) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let W = mount.clientWidth || 960;
      const H = 520;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
      camera.position.set(0, 10, 12.5);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "none";

      // ===== Тема =====
      const isLight = () => document.documentElement.classList.contains("light");
      let light = isLight();
      const neonHex = () => (isLight() ? 0xa855f7 : 0x22d3ee); // кундузги пурпле, тунги кўк
      const chassisHex = () => (isLight() ? 0xdcdce2 : 0x17171e);
      const bodyHex = () => (isLight() ? 0xf2f2f6 : 0x2a2a32);

      // ===== Ёруғлик =====
      const amb = new THREE.AmbientLight(0xffffff, light ? 0.95 : 0.55);
      scene.add(amb);
      const keyLight = new THREE.DirectionalLight(0xffffff, light ? 0.85 : 0.75);
      keyLight.position.set(4, 14, 7);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 50;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(-6, 7, -3);
      scene.add(fillLight);

      const neon = new THREE.PointLight(neonHex(), light ? 18 : 40, 26, 2);
      neon.position.set(0, 2.5, 4);
      scene.add(neon);

      // ===== Pivot =====
      const pivot = new THREE.Group();
      scene.add(pivot);

      // ===== Layout (реал клавиатура нисбатлари) =====
      const UNIT = 1.7, GAP = 0.16, KEY_H = 0.78, DEPTH = 1.5;
      const widthsByRow = [
        [1, 1, 1, 1, 1, 1],
        [1.3, 1, 1, 1, 1, 1.3],
        [1, 1, 1, 1.35, 1, 1],
        [1, 1.3, 1, 1, 1, 1.3],
        [1, 1, 1.35, 1, 1, 1],
      ];
      const COLS = 6;
      const rows: KeyItem[][] = [];
      for (let i = 0; i < keys.length; i += COLS) rows.push(keys.slice(i, i + COLS));
      const nRows = rows.length;

      let maxRowW = 0;
      rows.forEach((row, ri) => {
        const ws = widthsByRow[ri] || row.map(() => 1);
        let rw = 0;
        row.forEach((_, ci) => (rw += (ws[ci] || 1) * UNIT + GAP));
        rw -= GAP;
        maxRowW = Math.max(maxRowW, rw);
      });
      const totalDepth = nRows * (DEPTH + GAP) - GAP;
      const pad = 0.55;

      // ===== Корпус (Mac алюмин рамка) =====
      const chassisMat = new THREE.MeshStandardMaterial({ color: chassisHex(), roughness: light ? 0.45 : 0.5, metalness: light ? 0.55 : 0.45 });
      const chassisGeo = new RoundedBoxGeometry(maxRowW + pad * 2, 0.7, totalDepth + pad * 2, 5, 0.32);
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = -KEY_H / 2 - 0.28;
      chassis.castShadow = true;
      chassis.receiveShadow = true;
      pivot.add(chassis);

      // корпус остида нозик неон ҳошия
      const rimMat = new THREE.MeshBasicMaterial({ color: neonHex(), transparent: true, opacity: 0.0 });
      const rimGeo = new RoundedBoxGeometry(maxRowW + pad * 2 + 0.18, 0.12, totalDepth + pad * 2 + 0.18, 5, 0.06);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.y = -KEY_H / 2 - 0.62;
      pivot.add(rim);

      // ===== Соя ери (shadow-only, шаффоф фонда) =====
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.ShadowMaterial({ opacity: light ? 0.18 : 0.35 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -KEY_H / 2 - 0.66;
      ground.receiveShadow = true;
      scene.add(ground);

      // ===== Кейкаплар =====
      type KCap = {
        group: THREE.Group; item: KeyItem; baseY: number;
        body: THREE.Mesh; bodyMat: THREE.MeshStandardMaterial; topMat: THREE.MeshStandardMaterial;
        popping: boolean; t: number; hover: number;
      };
      const caps: KCap[] = [];
      const raycaster = new THREE.Raycaster();
      const hitMeshes: THREE.Object3D[] = [];

      rows.forEach((row, ri) => {
        const ws = widthsByRow[ri] || row.map(() => 1);
        let rowW = 0;
        row.forEach((_, ci) => (rowW += (ws[ci] || 1) * UNIT + GAP));
        rowW -= GAP;
        let x = -rowW / 2;
        const z = -totalDepth / 2 + ri * (DEPTH + GAP) + DEPTH / 2;

        row.forEach((item, ci) => {
          const w = (ws[ci] || 1) * UNIT;
          const g = new THREE.Group();

          const bodyMat = new THREE.MeshStandardMaterial({
            color: bodyHex(), roughness: 0.5, metalness: 0.1,
            emissive: new THREE.Color(neonHex()), emissiveIntensity: 0.0,
          });
          const body = new THREE.Mesh(new RoundedBoxGeometry(w, KEY_H, DEPTH, 4, 0.14), bodyMat);
          body.castShadow = true;
          body.receiveShadow = true;
          g.add(body);

          const tex = new THREE.CanvasTexture(makeKeycapTexture(item, light, dpr));
          tex.anisotropy = 8;
          const topMat = new THREE.MeshStandardMaterial({
            map: tex, roughness: 0.55, metalness: 0.0, transparent: true,
            emissive: new THREE.Color(neonHex()), emissiveIntensity: 0.0,
          });
          const top = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, DEPTH - 0.12), topMat);
          top.rotation.x = -Math.PI / 2;
          top.position.y = KEY_H / 2 + 0.011;
          g.add(top);

          g.position.set(x + w / 2, 0, z);
          pivot.add(g);

          const idx = caps.length;
          body.userData.capIndex = idx;
          top.userData.capIndex = idx;
          hitMeshes.push(body, top);
          caps.push({ group: g, item, baseY: 0, body, bodyMat, topMat, popping: false, t: 0, hover: 0 });
          x += w + GAP;
        });
      });

      pivot.rotation.x = -0.42; // сал юқоридан (ёрлиқлар ўқилсин)

      // ===== Drag orbit =====
      const drag = { on: false, px: 0, py: 0, rx: pivot.rotation.x, ry: pivot.rotation.y, moved: false };
      const pointer = new THREE.Vector2(999, 999);
      let hovered = -1;

      const setPointer = (cx: number, cy: number) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
      };
      const onDown = (e: PointerEvent) => {
        drag.on = true; drag.moved = false;
        drag.px = e.clientX; drag.py = e.clientY;
        drag.rx = pivot.rotation.x; drag.ry = pivot.rotation.y;
        renderer.domElement.style.cursor = "grabbing";
        try { renderer.domElement.setPointerCapture(e.pointerId); } catch {}
      };
      const onMove = (e: PointerEvent) => {
        setPointer(e.clientX, e.clientY);
        if (!drag.on) return;
        const dx = e.clientX - drag.px;
        const dy = e.clientY - drag.py;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        pivot.rotation.y = drag.ry + dx * 0.006;
        pivot.rotation.x = Math.max(-1.15, Math.min(0.1, drag.rx + dy * 0.005));
      };
      const onUp = (e: PointerEvent) => {
        renderer.domElement.style.cursor = "grab";
        if (drag.on && !drag.moved) {
          setPointer(e.clientX, e.clientY);
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(hitMeshes, false);
          if (hits.length) {
            const idx = hits[0].object.userData.capIndex as number;
            const cap = caps[idx];
            if (cap && !cap.popping) { cap.popping = true; cap.t = 0; }
          }
        }
        drag.on = false;
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      // ===== Анимация =====
      const clock = new THREE.Clock();
      let swayT = 0;
      let navigated = false;

      const animate = () => {
        if (disposed) return;
        const dt = Math.min(clock.getDelta(), 0.05);
        swayT += dt;

        // нозик тебраниш (тинч, ёрлиқлар ўқилади)
        if (!drag.on && !reduce) {
          pivot.rotation.y = Math.sin(swayT * 0.35) * 0.18;
        }

        if (!drag.on) {
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(hitMeshes, false);
          const nh = hits.length ? (hits[0].object.userData.capIndex as number) : -1;
          if (nh !== hovered) {
            hovered = nh;
            renderer.domElement.style.cursor = hovered >= 0 ? "pointer" : "grab";
            setHint(hovered >= 0 ? caps[hovered].item.label : "");
          }
        }

        let anyHover = false;
        caps.forEach((cap, i) => {
          const target = i === hovered && !cap.popping ? 1 : 0;
          if (target > 0) anyHover = true;
          cap.hover += (target - cap.hover) * 0.2;
          if (!cap.popping) {
            cap.topMat.emissiveIntensity = cap.hover * 0.45;
            cap.bodyMat.emissiveIntensity = cap.hover * 0.55;
            cap.group.position.y = cap.baseY + cap.hover * 0.26;
          } else {
            cap.t += dt;
            const p = Math.min(1, cap.t / 0.5);
            const ease = 1 - Math.pow(1 - p, 3);
            cap.group.position.y = cap.baseY + ease * 6.5;
            const s = 1 + ease * 0.4;
            cap.group.scale.set(s, s, s);
            cap.group.rotation.x = ease * 0.55;
            cap.topMat.opacity = 1 - ease;
            cap.bodyMat.transparent = true;
            cap.bodyMat.opacity = 1 - ease;
            cap.topMat.emissiveIntensity = (1 - ease) * 1.2;
            cap.bodyMat.emissiveIntensity = (1 - ease) * 1.2;
            if (p >= 1 && !navigated) { navigated = true; router.push(cap.item.href); }
          }
        });

        // неон ҳошия фақат hover'да юмшоқ ёнади
        const targetRim = anyHover ? (light ? 0.5 : 0.7) : 0.0;
        rimMat.opacity += (targetRim - rimMat.opacity) * 0.12;
        neon.intensity = (light ? 14 : 32) + (anyHover ? (light ? 12 : 26) : 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      // ===== Тема ўзгариши =====
      const applyTheme = () => {
        light = isLight();
        amb.intensity = light ? 0.95 : 0.55;
        keyLight.intensity = light ? 0.85 : 0.75;
        const nh = neonHex();
        neon.color.setHex(nh);
        rimMat.color.setHex(nh);
        chassisMat.color.setHex(chassisHex());
        chassisMat.roughness = light ? 0.45 : 0.5;
        chassisMat.metalness = light ? 0.55 : 0.45;
        (ground.material as THREE.ShadowMaterial).opacity = light ? 0.18 : 0.35;
        caps.forEach((cap) => {
          cap.bodyMat.color.setHex(bodyHex());
          cap.bodyMat.emissive.setHex(nh);
          cap.topMat.emissive.setHex(nh);
          const newTex = new THREE.CanvasTexture(makeKeycapTexture(cap.item, light, dpr));
          newTex.anisotropy = 8;
          cap.topMat.map?.dispose();
          cap.topMat.map = newTex;
          cap.topMat.needsUpdate = true;
        });
      };
      const themeObs = new MutationObserver(applyTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      // ===== Resize =====
      const onResize = () => {
        W = mount.clientWidth || 960;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        themeObs.disconnect();
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        renderer.dispose();
        scene.traverse((o: THREE.Object3D) => {
          const mesh = o as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (m) {
            if (Array.isArray(m)) m.forEach((x) => { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose(); });
            else { (m as THREE.MeshStandardMaterial).map?.dispose(); m.dispose(); }
          }
        });
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, [keys, router]);

  return (
    <div className="w-full flex flex-col items-center py-8 select-none">
      {title && (
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold mb-2 text-center" style={{ color: "var(--text)" }}>
          {title}
        </h2>
      )}
      <p className="text-xs mb-5 text-center" style={{ color: "var(--text-muted)" }}>
        🖱️ Drag to rotate · Click a key to open{hint ? ` · ${hint}` : ""}
      </p>
      <div ref={mountRef} style={{ width: "100%", maxWidth: 1000, height: 520 }} />
    </div>
  );
}

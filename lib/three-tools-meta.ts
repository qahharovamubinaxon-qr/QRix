/** 3D Tools registry — same config-driven pattern as every other category.
    Add a tool = add an entry; landing, SSG pages, SEO and search pick it up. */

export type ThreeTool = {
  slug: string;
  title: string;
  desc: string;
  emoji: string;
  grad: string;
  engine: "image-to-3d";
  status: "live";
  keywords: string[];
  intro: string;
  about: string;
  steps: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
};

export const THREE_TOOLS: ThreeTool[] = [
  {
    slug: "image-to-3d",
    title: "Image to 3D Model",
    desc: "Turn one photo into a textured 3D model — preview, rotate and export GLB, OBJ, STL or USDZ.",
    emoji: "🧊",
    grad: "linear-gradient(135deg,#bba9ff,#22d3ee)",
    engine: "image-to-3d",
    status: "live",
    keywords: ["image to 3d", "photo to 3d model", "ai 3d generator", "glb converter", "stl from image", "usdz", "3d mesh from photo"],
    intro: "Upload a single image and QRix generates a high-quality 3D model you can inspect right in the browser — orbit, zoom, relight — then download in GLB, OBJ, STL or USDZ.",
    about: "The generator routes through the QRix AI Provider Manager (Fal.ai, Replicate and more, with automatic fallback) and queues the job with live progress. Without a cloud provider it still builds an instant on-device 3D preview from your image with full export support. Your first 3 generations are free; afterwards each model costs 20 credits.",
    steps: [
      { title: "Upload a photo", desc: "One clear image of the object — PNG or JPG, centred, plain background works best." },
      { title: "Generate", desc: "The AI meshes your image with live progress and ETA; cancel anytime." },
      { title: "Inspect in 3D", desc: "Orbit, zoom and switch studio lighting right in the browser." },
      { title: "Export", desc: "Download GLB, OBJ, STL or USDZ — watermark-free." },
    ],
    faqs: [
      { q: "How many generations are free?", a: "Every account gets 3 free 3D generations. After that a generation costs 20 credits — Free plans include 60 credits per month, Pro 1000." },
      { q: "Which formats can I export?", a: "GLB (best for web/AR), OBJ (universal), STL (3D printing) and USDZ (Apple AR Quick Look)." },
      { q: "What images work best?", a: "A single object, centred, on a plain background, at 512px or larger. Product shots and toys work great." },
      { q: "Is there a watermark?", a: "The interactive preview shows a small QRix badge on the Free plan; exported files are never watermarked, and Pro removes the badge entirely." },
    ],
  },
];

export const getThreeTool = (slug: string) => THREE_TOOLS.find((t) => t.slug === slug);

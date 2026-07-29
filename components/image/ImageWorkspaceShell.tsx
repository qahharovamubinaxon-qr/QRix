import { FiUploadCloud } from "react-icons/fi";

/* The server-rendered stand-in for a `dynamic(ssr:false)` image engine.

   Every /convert/<pair> and /resize/<preset> page — ~120 programmatic URLs, two
   thirds of them RU/UZ twins — used to serve crawlers and slow phones a spinner
   labelled "Loading the image workspace…", so the main content area of the page
   was literally absent from the HTML: unique SEO copy wrapped around nothing.
   This renders the dropzone's real anatomy instead (heading, <label>, a real
   input[type=file], the format hint, and the engine's own output target), and
   holds no hooks so it costs nothing to hydrate.

   The input is disabled on purpose. The engine chunk lands a few hundred ms
   later and replaces this subtree; a file chosen before then would be dropped
   on the floor with no message, which is worse than a control that says it is
   not ready yet. The status line says so, in the reader's language. */

type Lang = "ru" | "uz" | undefined;

const T = {
  en: {
    drop: "Drop a file here, or click to choose one",
    dropMany: "Drop your files here, or click to choose them",
    hint: "JPG, PNG or WebP · processed on your device",
    out: "Output",
    busy: "Preparing the workspace…",
  },
  ru: {
    drop: "Перетащите файл сюда или нажмите, чтобы выбрать",
    dropMany: "Перетащите файлы сюда или нажмите, чтобы выбрать",
    hint: "JPG, PNG или WebP · обрабатывается на вашем устройстве",
    out: "Результат",
    busy: "Готовим рабочую область…",
  },
  uz: {
    drop: "Faylni shu yerga tashlang yoki tanlash uchun bosing",
    dropMany: "Fayllarni shu yerga tashlang yoki tanlash uchun bosing",
    hint: "JPG, PNG yoki WebP · qurilmangizda ishlanadi",
    out: "Natija",
    busy: "Ish maydoni tayyorlanmoqda…",
  },
} as const;

const MIME_LABEL: Record<string, string> = {
  jpeg: "JPG", png: "PNG", webp: "WebP", avif: "AVIF",
  bmp: "BMP", ico: "ICO", gif: "GIF", tiff: "TIFF",
};

/* What this particular engine produces, derived from the key the page already
   passes — so the shell text differs per URL instead of repeating one boilerplate
   across 120 pages. Anything we cannot name confidently returns null and the
   line is omitted rather than guessed. */
export function engineTarget(engine: string): string | null {
  if (engine.startsWith("convert:")) return MIME_LABEL[engine.slice(8)] ?? null;
  const size = /^resize:(\d+)x(\d+)$/.exec(engine);
  if (size) return `${size[1]}×${size[2]}`;
  return null;
}

export default function ImageWorkspaceShell({
  engine,
  lang,
  multiple = false,
}: {
  engine: string;
  lang?: Lang;
  multiple?: boolean;
}) {
  const t = T[lang ?? "en"];
  const target = engineTarget(engine);
  const id = `qx-ws-${engine.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <div
      className="relative rounded-3xl p-10 text-center"
      style={{ border: "2px dashed var(--border-glass)", background: "var(--surface)" }}
      aria-busy="true"
    >
      <span
        className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--grad-primary)", color: "#0b0b0b", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}
      >
        <FiUploadCloud size={24} />
      </span>

      <label htmlFor={id} className="block font-bold text-[15px]" style={{ color: "var(--text)" }}>
        {multiple ? t.dropMany : t.drop}
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple || undefined}
        disabled
        className="hidden"
      />

      <p className="text-[12px] mt-1.5" style={{ color: "var(--text-faint)" }}>{t.hint}</p>
      {/* One template literal, not two adjacent expressions: hydratable SSR
          separates neighbouring JSX text nodes with an HTML comment, which would
          split the phrase into "Output<!-- -->: <!-- -->JPG" in the markup a
          crawler reads. */}
      {target && (
        <p className="text-[12px] mt-1 font-semibold" style={{ color: "var(--text-muted)" }}>
          {`${t.out}: ${target}`}
        </p>
      )}
      <p className="text-[11px] mt-3 qx-mono" style={{ color: "var(--text-faint)" }} role="status">
        {t.busy}
      </p>
    </div>
  );
}

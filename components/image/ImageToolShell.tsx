import { FiUploadCloud } from "react-icons/fi";

/* The server-rendered stand-in for an image engine.
   ───────────────────────────────────────────────────────────────────────────
   Every engine in ImageEngineRegistry is dynamic(ssr:false), so until this
   existed the served HTML for /convert/* and /resize/* carried the h1 and ~550
   words of body copy but zero evidence that a tool was on the page: 0
   input[type=file], 0 <label>, measured live on production. A crawler reading
   the HTML saw an article about converting images, not an image converter,
   which is the SXO "page-type mismatch" the M142 audit flagged.

   CORRECTION (M147b) to what this comment first claimed. ssr:false does NOT
   suppress the `loading` fallback server-side: on Next 16.2.7 that fallback is
   in the SSR output. Measured three times — the string "Loading the image
   workspace…" was in production's stripped HTML before M147 shipped, and it is
   still in /image-tools/gradient-generator's HTML today, which is the one
   engine the registry now skips. So enriching the fallback, the fix the audit
   suggested, would in fact have worked. This shell is still the better shape:
   it does not depend on an undocumented Next rendering detail, and a spinner is
   not content whether or not it reaches the crawler.

   This is deliberately NOT a copy of AiDropzone. AiDropzone is a div with
   role="button" and a hidden input, which is right for a mouse/keyboard user
   but is exactly the markup a crawler cannot read. Here the input is a real,
   visible, labelled control — that is the whole point of the file.

   It is replaced by the live engine one tick after hydration (see the registry),
   so the interactive experience is unchanged. */
/* Two thirds of the URLs this shell stands on are the RU/UZ twins of /convert
   and /resize — 102 of them — so an English-only control here would repeat the
   M125 defect: a reader sent to a page written in their language, meeting a
   tool that is not. Explicit `label`/`hint` props still win when a caller has
   something more specific to say. */
type Lang = "ru" | "uz";

const T = {
  en: {
    one: "Choose an image", many: "Choose images",
    hint: "JPG, PNG or WebP · processed on your device",
    out: "Output",
    noscript: "This tool runs entirely in your browser, so it needs JavaScript enabled. Nothing is uploaded either way.",
  },
  ru: {
    one: "Выберите изображение", many: "Выберите изображения",
    hint: "JPG, PNG или WebP · обрабатывается на вашем устройстве",
    out: "Результат",
    noscript: "Инструмент работает полностью в вашем браузере, поэтому нужен включённый JavaScript. Ничего никуда не загружается в любом случае.",
  },
  uz: {
    one: "Rasm tanlang", many: "Rasmlarni tanlang",
    hint: "JPG, PNG yoki WebP · qurilmangizda ishlanadi",
    out: "Natija",
    noscript: "Bu asbob to'liq brauzeringizda ishlaydi, shuning uchun JavaScript yoqilgan bo'lishi kerak. Har holda hech narsa hech qayerga yuklanmaydi.",
  },
} as const;

const MIME_LABEL: Record<string, string> = {
  jpeg: "JPG", png: "PNG", webp: "WebP", avif: "AVIF",
  bmp: "BMP", ico: "ICO", gif: "GIF", tiff: "TIFF",
};

/* What this particular engine produces, read off the key the page already
   passes, so the 242 URLs sharing this shell do not share one boilerplate.
   Anything that cannot be named confidently returns null and the line is
   omitted — a guessed output format would be a false claim on the page. */
export function engineTarget(engine: string | undefined): string | null {
  if (!engine) return null;
  if (engine.startsWith("convert:")) return MIME_LABEL[engine.slice(8)] ?? null;
  const size = /^resize:(\d+)x(\d+)$/.exec(engine);
  return size ? `${size[1]}×${size[2]}` : null;
}

export default function ImageToolShell({
  accept = "image/*",
  multiple = false,
  hint,
  label,
  engine,
  lang,
}: {
  accept?: string;
  multiple?: boolean;
  hint?: string;
  label?: string;
  engine?: string;
  lang?: Lang;
}) {
  const t = T[lang ?? "en"];
  const target = engineTarget(engine);
  return (
    <div
      className="relative rounded-3xl p-10 text-center"
      style={{ border: "2px dashed var(--border-glass)", background: "var(--surface)" }}
    >
      <span
        aria-hidden
        className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--grad-primary)", color: "#0b0b0b", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}
      >
        <FiUploadCloud size={24} />
      </span>

      <label htmlFor="image-tool-file" className="font-bold text-[15px] block" style={{ color: "var(--text)" }}>
        {label || (multiple ? t.many : t.one)}
      </label>

      <input
        id="image-tool-file"
        name="image-tool-file"
        type="file"
        accept={accept}
        multiple={multiple}
        className="mx-auto mt-3 block text-[12px]"
        style={{ color: "var(--text-faint)", maxWidth: "100%" }}
      />

      <p className="text-[12px] mt-3" style={{ color: "var(--text-faint)" }}>
        {hint || t.hint}
      </p>

      {/* One template literal, not two adjacent expressions: hydratable SSR
          separates neighbouring JSX text nodes with an HTML comment, which
          would ship this as "Output<!-- -->: <!-- -->JPG" in the markup a
          crawler reads. */}
      {target && (
        <p className="text-[12px] mt-1 font-semibold" style={{ color: "var(--text-muted)" }}>
          {`${t.out}: ${target}`}
        </p>
      )}

      {/* Honesty: with JS off this control genuinely cannot do anything — the
          conversion is canvas work in the browser, there is no server endpoint
          behind it. Say so rather than leaving a file picker that silently
          swallows a selection. */}
      <noscript>
        <p className="text-[12px] mt-3" style={{ color: "var(--text-faint)" }}>
          {t.noscript}
        </p>
      </noscript>
    </div>
  );
}

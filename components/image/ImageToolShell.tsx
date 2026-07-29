import { FiUploadCloud } from "react-icons/fi";

/* The server-rendered stand-in for an image engine.
   ───────────────────────────────────────────────────────────────────────────
   Every engine in ImageEngineRegistry is dynamic(ssr:false), and ssr:false
   renders NOTHING during SSR — not the component, and not the `loading`
   fallback either. So until this existed, the served HTML for /convert/* and
   /resize/* carried the h1 and ~550 words of body copy but zero evidence that
   a tool was on the page: 0 input[type=file], 0 <label>, measured live on
   production. A crawler reading the HTML saw an article about converting
   images, not an image converter, which is the SXO "page-type mismatch" the
   M142 audit flagged.

   This is deliberately NOT a copy of AiDropzone. AiDropzone is a div with
   role="button" and a hidden input, which is right for a mouse/keyboard user
   but is exactly the markup a crawler cannot read. Here the input is a real,
   visible, labelled control — that is the whole point of the file.

   It is replaced by the live engine one tick after hydration (see the registry),
   so the interactive experience is unchanged. */
export default function ImageToolShell({
  accept = "image/*",
  multiple = false,
  hint,
  label,
}: {
  accept?: string;
  multiple?: boolean;
  hint?: string;
  label?: string;
}) {
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
        {label || (multiple ? "Choose images" : "Choose an image")}
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
        {hint || "JPG, PNG or WebP · processed on your device"}
      </p>

      {/* Honesty: with JS off this control genuinely cannot do anything — the
          conversion is canvas work in the browser, there is no server endpoint
          behind it. Say so rather than leaving a file picker that silently
          swallows a selection. */}
      <noscript>
        <p className="text-[12px] mt-3" style={{ color: "var(--text-faint)" }}>
          This tool runs entirely in your browser, so it needs JavaScript enabled.
          Nothing is uploaded either way.
        </p>
      </noscript>
    </div>
  );
}

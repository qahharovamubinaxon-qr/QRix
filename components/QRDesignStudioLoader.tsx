"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useModalA11y } from "@/lib/use-modal-a11y";

/* QRDesignStudio is 36.5 KB raw and it was eager on the homepage AND on all 40
 * /qr-tools/* routes — the two templates that matter most — for a modal that
 * only a click on "Customize Design" can ever open. Both call sites already
 * rendered it as {designOpen && <QRDesignStudio/>}, so the markup was never on
 * the page; only the bytes were. This is the ~60 lines that fetch it when
 * someone actually wants it.
 *
 * Two things it has to get right, both learned the hard way in this repo:
 *
 *   INTENT, not the click. Deferring a modal behind its own onClick would trade
 *   36.5 KB for a visible stall on a slow connection, and CLAUDE.md says only
 *   improve. warmDesignStudio() runs on pointerenter/focus of the trigger —
 *   a whole intent ahead of the click — the same trick HeroSearch uses for the
 *   search catalog (M138). By the time the button is pressed the chunk is
 *   usually already resolved and the modal opens in the same tick it always did.
 *
 *   A DYNAMIC IMPORT CAN FAIL. A static one cannot, so deferring introduces a
 *   failure mode that did not exist before (f212ba2 made the same point about
 *   ReviewsSection). A dropped chunk here must not be a dead button: the error
 *   is a state, it says so, and it offers a retry.
 */

export type DesignStudioProps = {
  value: string;
  initialFg?: string;
  initialBg?: string;
  initialLevel?: "L" | "M" | "Q" | "H";
  initialLogo?: string | null;
  onClose: () => void;
  onApply?: (basics: { fg: string; bg: string; level: "L" | "M" | "Q" | "H"; logo: string | null }) => void;
};

type Studio = ComponentType<DesignStudioProps>;

/* Module scope, so a page with two triggers warms once and a reopen is free. */
let cached: Studio | null = null;
let inflight: Promise<Studio> | null = null;

function load(): Promise<Studio> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = import("./QRDesignStudio")
      .then((m) => {
        cached = m.default;
        return m.default;
      })
      .catch((err) => {
        inflight = null; // a retry must be able to try again
        throw err;
      });
  }
  return inflight;
}

/** Call on hover/focus of whatever opens the studio. Safe to call repeatedly. */
export function warmDesignStudio() {
  void load().catch(() => {});
}

/** Props to spread onto the trigger button so intent warms the chunk. */
export const designStudioTriggerProps = {
  onPointerEnter: warmDesignStudio,
  onFocus: warmDesignStudio,
} as const;

export default function QRDesignStudioLoader(props: DesignStudioProps) {
  /* MUST be the lazy form. useState(cached) passes a FUNCTION — a component is
   * one — and React treats a function initial value as an initializer and calls
   * it, so a reopen (when `cached` is populated) would invoke QRDesignStudio
   * outside of rendering and throw. The first open is unaffected, because
   * `cached` is still null there, which is exactly why this ships silently.
   * Same reason every setStudio below is written setStudio(() => C). */
  const [Studio, setStudio] = useState<Studio | null>(() => cached);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  /* The waiting state has NO focusable control in it — it is one <p> — so
     Escape is the only way out of it, and there was none. When the studio
     itself arrives it takes over the screen and runs its own hook. */
  const placeholderRef = useModalA11y<HTMLDivElement>(!Studio, props.onClose);

  useEffect(() => {
    if (cached) {
      setStudio(() => cached);
      return;
    }
    let alive = true;
    setFailed(false);
    load().then(
      (C) => { if (alive) setStudio(() => C); },
      () => { if (alive) setFailed(true); },
    );
    return () => { alive = false; };
  }, [attempt]);

  if (Studio) return <Studio {...props} />;

  return (
    <div
      ref={placeholderRef}
      role="dialog"
      aria-modal="true"
      aria-label="QR Design Studio"
      aria-busy={!failed}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) props.onClose(); }}
    >
      <div
        className="rounded-2xl px-6 py-5 text-center"
        style={{ background: "var(--surface, #141414)", border: "1px solid var(--border, rgba(255,255,255,0.12))", color: "var(--text, #fff)" }}
      >
        {failed ? (
          <>
            <p className="text-sm font-medium">The Design Studio could not load.</p>
            <p className="mt-1 text-xs opacity-70">Check the connection and try again — your QR code is untouched.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setAttempt((n) => n + 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: "var(--primary, #ff4d1c)", color: "#fff" }}
              >
                Try again
              </button>
              <button onClick={props.onClose} className="rounded-lg px-3 py-1.5 text-xs font-medium opacity-70">
                Close
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm opacity-80">Opening the Design Studio…</p>
        )}
      </div>
    </div>
  );
}

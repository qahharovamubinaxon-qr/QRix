"use client";

/* Shared dialog behaviour — Escape, focus trap, focus restoration.
   ───────────────────────────────────────────────────────────────────────────
   Written for M157 after a sweep found five live modals with five different
   answers: CommandSearch had Escape and an autofocused input but no trap;
   QRDesignStudio and the dashboard drawer had the ARIA attributes and nothing
   behind them; AiKit's fullscreen viewer had neither. A keyboard user who
   opened any of them was left tabbing through the page behind the overlay.

   One hook rather than four fixes, because the parts that are easy to get
   wrong are the same every time:

   · the trigger must be captured BEFORE focus moves inside, or "restore focus
     to what opened this" restores to whatever the dialog focused first;
   · restoration must survive the trigger disappearing (a modal that navigates
     unmounts the button that opened it) — hence the isConnected check;
   · only the TOPMOST dialog may answer Escape, or one keypress closes a modal
     and the palette above it;
   · and the trap must stand down for keys a component already handled. That
     one is not hypothetical: CommandSearch binds Tab to cycle its filters and
     calls preventDefault, so a trap that moves focus on every Tab would take
     a working feature away. `defaultPrevented` is the whole guard. */

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* Open dialogs, innermost last. Module scope so nested dialogs can see
   each other; a symbol per mount so two instances never collide. */
const openDialogs: symbol[] = [];

/* getClientRects() rather than offsetParent: a display:none control has no
   rects, and offsetParent is null for position:fixed elements — which every
   one of these overlays is. */
function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"]'),
  );
}

export function useModalA11y<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
  /* autoFocus:false for dialogs that focus something themselves — moving
     focus twice is a visible flicker, and the component knows better. */
  opts: { autoFocus?: boolean } = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const autoFocus = opts.autoFocus !== false;

  useEffect(() => {
    const root = ref.current;
    if (!open || !root) return;

    const token = Symbol("dialog");
    openDialogs.push(token);
    const isTopmost = () => openDialogs[openDialogs.length - 1] === token;

    /* Read before anything below can move focus. */
    const trigger = document.activeElement as HTMLElement | null;

    if (autoFocus && !root.contains(document.activeElement)) {
      const first = focusableWithin(root)[0];
      if (first) first.focus();
      else {
        root.tabIndex = -1;
        root.focus();
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !isTopmost()) return;

      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusableWithin(root);
      if (!items.length) {
        e.preventDefault();
        root.tabIndex = -1;
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const outside = !root.contains(active);

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const i = openDialogs.lastIndexOf(token);
      if (i >= 0) openDialogs.splice(i, 1);
      /* A dialog that navigated away has no trigger left to return to. */
      if (trigger?.isConnected && typeof trigger.focus === "function") trigger.focus();
    };
  }, [open, autoFocus]);

  return ref;
}

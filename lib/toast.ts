"use client";

/* Tiny event-based toast bus — call toast.success("Saved") from anywhere.
   <Toaster/> (mounted in the root layout) renders them. Zero deps. */

export type ToastKind = "success" | "error" | "warning" | "info" | "loading";
export type ToastMsg = { id: string; kind: ToastKind; text: string; ttl: number };

function emit(kind: ToastKind, text: string, ttl = 3200) {
  if (typeof window === "undefined") return "";
  const id = Math.random().toString(36).slice(2);
  window.dispatchEvent(new CustomEvent("qrix-toast", { detail: { id, kind, text, ttl } as ToastMsg }));
  return id;
}
export function dismissToast(id: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("qrix-toast-dismiss", { detail: id }));
}

export const toast = {
  success: (t: string) => emit("success", t),
  error: (t: string) => emit("error", t, 4200),
  warning: (t: string) => emit("warning", t, 3800),
  info: (t: string) => emit("info", t),
  loading: (t: string) => emit("loading", t, 999999),
};

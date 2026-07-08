/** Route-level loading state — top bar + pulsing brand mark, no blank page. */
export default function Loading() {
  return (
    <>
      <div className="qx-loadbar" role="progressbar" aria-label="Loading" />
      <div className="min-h-[50vh] grid place-items-center" aria-hidden>
        <div className="text-center">
          <span className="font-display text-2xl font-extrabold inline-block animate-pulse tracking-tight">
            <span style={{ background: "var(--grad-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>QR</span>
            <span style={{ color: "var(--text)" }}>ix</span>
          </span>
          <div className="mt-4 w-40 h-2 rounded-full overflow-hidden mx-auto" style={{ background: "var(--surface-2)" }}>
            <div className="h-full w-1/3 rounded-full" style={{ background: "var(--grad-primary)", animation: "qxBar 1.1s ease-in-out infinite" }} />
          </div>
        </div>
      </div>
    </>
  );
}

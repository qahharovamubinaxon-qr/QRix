"use client";

/** Root error boundary — catches failures in the root layout itself.
    Must render its own <html>/<body> (Next.js global-error contract). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b12", color: "#f4f4f6", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 48, margin: 0 }} role="img" aria-label="error">⚡</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 6px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 20px" }}>An unexpected error occurred. Your files never left your device.</p>
          <button onClick={reset} style={{ background: "#e1ff04", color: "#0b0b0b", fontWeight: 700, border: 0, borderRadius: 12, padding: "12px 22px", cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

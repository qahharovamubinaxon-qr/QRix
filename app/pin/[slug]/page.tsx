import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

/* Deliberately plain: flat black, one input, one button, no card, no gradient,
   no glow, no motion. The visitor scanned a code to open a link — every extra
   element is something between them and that. Colours are literal rather than
   themed because `qx-bare` forces a black page in both themes. */

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  fontSize: "20px",
  textAlign: "center",
  letterSpacing: "0.3em",
  color: "#fff",
  background: "#000",
  border: "1px solid #333",
  borderRadius: "8px",
  outline: "none",
};

const BUTTON: React.CSSProperties = {
  width: "100%",
  marginTop: "12px",
  padding: "16px",
  fontSize: "15px",
  fontWeight: 600,
  color: "#000",
  background: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error } = await searchParams;

  const { data } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <p style={{ color: "#888", fontSize: "15px", textAlign: "center" }}>
          This link does not exist or was removed.
        </p>
      </main>
    );
  }

  if (!data.pin) {
    redirect(`/r/${slug}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "300px" }}>
        <h1 style={{ color: "#fff", fontSize: "17px", fontWeight: 600, textAlign: "center", marginBottom: "6px" }}>
          Enter PIN
        </h1>
        <p style={{ color: "#777", fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>
          This link is protected
        </p>

        {error && (
          <p style={{ color: "#e05252", fontSize: "13px", textAlign: "center", marginBottom: "16px" }}>
            {error === "rate" ? "Too many attempts — wait a few minutes" : "Wrong PIN"}
          </p>
        )}

        <form action={`/pin/${slug}/verify`} method="POST">
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            aria-label="PIN"
            autoFocus
            style={INPUT}
          />
          <button type="submit" style={BUTTON}>
            Open
          </button>
        </form>
      </div>
    </main>
  );
}

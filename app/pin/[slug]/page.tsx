import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiLock } from "react-icons/fi";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-gradient)" }}>
        <div className="qx-card p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>Link not found</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>This QR code does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  if (!data.pin) {
    redirect(`/r/${slug}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-gradient)" }}>
      <div className="qx-card p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: "var(--grad-primary)", boxShadow: "var(--glow-primary)" }}>
            <FiLock size={24} />
          </span>
          <h1 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>
            PIN Protected
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            Enter the PIN to open this link
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs text-center"
            style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)", color: "var(--danger)" }}>
            {error === "rate"
              ? "🔒 Too many attempts — please wait a few minutes and try again"
              : "❌ Wrong PIN — try again"}
          </div>
        )}

        <form action={`/pin/${slug}/verify`} method="POST">
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            placeholder="Enter PIN"
            autoFocus
            className="w-full px-4 py-3.5 text-center text-lg tracking-[0.3em] rounded-xl"
            style={{ background: "var(--surface-hover)", border: "1.5px solid var(--border-strong)", color: "var(--text)" }}
          />
          <button type="submit" className="qx-btn w-full mt-4 !py-3.5">
            Open Link →
          </button>
        </form>

        <p className="text-[11px] text-center mt-5" style={{ color: "var(--text-faint)" }}>
          Protected by QRix
        </p>
      </div>
    </div>
  );
}

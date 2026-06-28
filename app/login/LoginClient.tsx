"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import AuthMascot from "@/components/AuthMascot";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [covering, setCovering] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) { setError(error.message); return; }
    if (!data.session) { setError("Unable to establish session. Please try again."); return; }

    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
    } catch (err) {
      console.warn("Failed to sync session to server cookies", err);
    }

    router.replace(next);
  };

  const coverEyes = covering && !show;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative">
      <div className="flex items-end justify-center gap-6 mb-[-26px] relative z-10 pointer-events-none">
        <AuthMascot covering={coverEyes} color="#8b5cf6" size={104} />
        <AuthMascot covering={coverEyes} color="#F58F20" size={92} />
      </div>

      <div className="qx-card w-full max-w-md p-8 relative z-0">
        <div className="text-center mb-7 pt-2">
          <h1 className="font-display text-[26px] font-extrabold mb-1.5" style={{ color: "var(--text)" }}>
            Welcome back
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Sign in to access your dashboard & saved QR codes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--primary)" }}><FiMail size={15} /></span>Email
            </span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required className="qx-auth-input" />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--primary)" }}><FiLock size={15} /></span>Password
            </span>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setCovering(true)} onBlur={() => setCovering(false)}
                placeholder="••••••••" required className="qx-auth-input pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: "#fca5a5", background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.25)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="qx-btn-hero w-full disabled:opacity-60">
            {loading ? "Signing in…" : <>Sign in <FiArrowRight size={15} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold" style={{ color: "var(--primary)" }}>
            Sign up
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-6 text-[12px]" style={{ color: "var(--text-faint)" }}>
        ← Back to home
      </Link>
    </main>
  );
}

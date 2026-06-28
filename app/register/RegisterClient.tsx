"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { FiMail, FiLock, FiArrowRight, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import AuthMascot from "@/components/AuthMascot";

export default function RegisterClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [covering, setCovering] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) router.replace(next);
    });
    return () => { mounted = false; };
  }, [router, next]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabaseBrowser.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  // password is hidden visually unless `show`; cover the mascot's eyes while focused & hidden
  const coverEyes = covering && !show;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative">
      {/* Mascots peeking above the card */}
      <div className="flex items-end justify-center gap-6 mb-[-26px] relative z-10 pointer-events-none">
        <AuthMascot covering={coverEyes} color="#F58F20" size={104} />
        <AuthMascot covering={coverEyes} color="#22b14c" size={92} />
      </div>

      <div className="qx-card w-full max-w-md p-8 relative z-0">
        <div className="text-center mb-7 pt-2">
          <h1 className="font-display text-[26px] font-extrabold mb-1.5" style={{ color: "var(--text)" }}>
            Create your account
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Join QRix to manage dynamic QR codes & analytics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field icon={<FiMail size={15} />} label="Email">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="qx-auth-input"
            />
          </Field>

          <Field icon={<FiLock size={15} />} label="Password">
            <div className="relative">
              <input
                type={show ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setCovering(true)} onBlur={() => setCovering(false)}
                placeholder="••••••••" required minLength={6}
                className="qx-auth-input pr-10"
              />
              <button type="button" onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}
                aria-label={show ? "Hide password" : "Show password"}>
                {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </Field>

          <Field icon={<FiCheck size={15} />} label="Confirm password">
            <input
              type={show ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setCovering(true)} onBlur={() => setCovering(false)}
              placeholder="••••••••" required
              className="qx-auth-input"
            />
          </Field>

          {error && (
            <p className="text-[13px] px-3 py-2 rounded-lg" style={{ color: "#fca5a5", background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.25)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="qx-btn-hero w-full disabled:opacity-60">
            {loading ? "Creating account…" : <>Sign up <FiArrowRight size={15} /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold" style={{ color: "var(--primary)" }}>
            Sign in
          </Link>
        </p>
      </div>

      <Link href="/" className="mt-6 text-[12px]" style={{ color: "var(--text-faint)" }}>
        ← Back to home
      </Link>
    </main>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
        <span style={{ color: "var(--primary)" }}>{icon}</span>{label}
      </span>
      {children}
    </label>
  );
}

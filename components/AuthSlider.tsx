"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { FcGoogle } from "react-icons/fc";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

type Mode = "signin" | "signup";

/**
 * Single-page auth: sign-in and sign-up live side by side and a branded
 * overlay panel slides between them (desktop). Below 900px the overlay
 * hides and the footer links toggle the visible form instead.
 */
export default function AuthSlider({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [notice, setNotice] = useState<string | null>(null);

  // Keep /login ↔ /register in the address bar without remounting.
  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setNotice(null);
    const path = m === "signin" ? "/login" : "/register";
    window.history.replaceState(null, "", `${path}?next=${encodeURIComponent(next)}`);
  }, [next]);

  // Already signed in? Go straight to the destination.
  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) router.replace(next);
    });
    return () => { mounted = false; };
  }, [router, next]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-14">
      <div className={`qx-auth ${mode === "signup" ? "qx-auth--signup" : ""}`}>
        {/* ── Sign-in pane ── */}
        <section className="qx-auth-pane qx-auth-pane--in" aria-hidden={mode !== "signin"}>
          <SignInForm next={next} notice={mode === "signin" ? notice : null}
            onSwitch={() => switchMode("signup")} active={mode === "signin"} />
        </section>

        {/* ── Sign-up pane ── */}
        <section className="qx-auth-pane qx-auth-pane--up" aria-hidden={mode !== "signup"}>
          <SignUpForm next={next} active={mode === "signup"}
            onSwitch={() => switchMode("signin")}
            onNeedsConfirm={(msg) => { setNotice(msg); switchMode("signin"); }} />
        </section>

        {/* ── Sliding brand overlay (desktop) ── */}
        <div className="qx-auth-ov" aria-hidden>
          <div className="qx-auth-ov-inner">
            <div className="qx-auth-ov-panel qx-auth-ov-panel--left">
              <span className="qx-auth-ov-brand font-display">QR<em>ix</em></span>
              <h2 className="qx-auth-ov-title font-display">Welcome back</h2>
              <p className="qx-auth-ov-sub">Already have an account? Sign in to reach your dashboard, saved QR codes and analytics.</p>
              <button type="button" className="qx-auth-ov-btn" tabIndex={mode === "signup" ? 0 : -1}
                onClick={() => switchMode("signin")}>
                Sign in
              </button>
            </div>
            <div className="qx-auth-ov-panel qx-auth-ov-panel--right">
              <span className="qx-auth-ov-brand font-display">QR<em>ix</em></span>
              <h2 className="qx-auth-ov-title font-display">New here?</h2>
              <p className="qx-auth-ov-sub">Create a free account — dynamic QR codes, scan analytics and 185+ tools, no credit card.</p>
              <button type="button" className="qx-auth-ov-btn" tabIndex={mode === "signin" ? 0 : -1}
                onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </div>
            <div className="qx-embers" aria-hidden>{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div>
          </div>
        </div>
      </div>

      <Link href="/" className="mt-5 text-[12px]" style={{ color: "var(--text-faint)" }}>← Back to home</Link>
    </main>
  );
}

/* ─────────────────────────── shared pieces ─────────────────────────── */

async function syncSession(session: { access_token: string; refresh_token: string }) {
  try {
    await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
    });
  } catch (err) {
    console.warn("Failed to sync session to server cookies", err);
  }
}

async function claimReferral() {
  try {
    const m = document.cookie.match(/(?:^|; )qrix_ref=([a-z0-9]{4,16})/);
    if (m) {
      await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: m[1] }),
      });
      document.cookie = "qrix_ref=; path=/; max-age=0";
    }
  } catch { /* non-blocking */ }
}

function GoogleButton({ next, onError, disabled }: { next: string; onError: (m: string) => void; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    setBusy(true);
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setBusy(false); onError(error.message); }
    // On success the browser is redirected to Google — no further state here.
  };
  return (
    <button type="button" className="qx-auth-gbtn" onClick={handleClick} disabled={busy || disabled}>
      <FcGoogle size={18} aria-hidden />
      {busy ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function Divider() {
  return (
    <div className="qx-auth-div" aria-hidden>
      <span>or continue with email</span>
    </div>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p className="text-[13px] px-3 py-2 rounded-lg" role="alert"
      style={{ color: "#fca5a5", background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.25)" }}>
      {text}
    </p>
  );
}

function PasswordInput({ value, onChange, placeholder = "••••••••", minLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required minLength={minLength} className="qx-auth-input pr-10" />
      <button type="button" onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-faint)" }}
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
      {children}
    </span>
  );
}

/* ─────────────────────────── sign in ─────────────────────────── */

function SignInForm({ next, notice, onSwitch, active }: {
  next: string; notice: string | null; onSwitch: () => void; active: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (!data.session) { setError("Unable to establish session. Please try again."); return; }
    await syncSession(data.session);
    window.location.assign(next);
  };

  return (
    <div className="qx-auth-form">
      <h1 className="qx-auth-h font-display">Sign in to QRix</h1>
      <p className="qx-auth-s">Your dashboard, saved QR codes and analytics.</p>

      <GoogleButton next={next} onError={setError} disabled={!active} />
      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required className="qx-auth-input" />
        </label>
        <label className="block">
          <FieldLabel>Password</FieldLabel>
          <PasswordInput value={password} onChange={setPassword} />
        </label>

        {notice && (
          <p className="text-[13px] px-3 py-2 rounded-lg"
            style={{ color: "#86efac", background: "rgba(70,116,52,0.14)", border: "1px solid rgba(70,116,52,0.3)" }}>
            {notice}
          </p>
        )}
        {error && <ErrorNote text={error} />}

        <button type="submit" disabled={loading || !active} className="qx-btn-hero w-full disabled:opacity-60">
          {loading ? "Signing in…" : <>Sign in <FiArrowRight size={15} /></>}
        </button>
      </form>

      <p className="qx-auth-foot">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold" style={{ color: "var(--primary-bright)" }}>
          Sign up
        </button>
      </p>
    </div>
  );
}

/* ─────────────────────────── sign up ─────────────────────────── */

function SignUpForm({ next, active, onSwitch, onNeedsConfirm }: {
  next: string; active: boolean; onSwitch: () => void; onNeedsConfirm: (msg: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { data, error } = await supabaseBrowser.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }

    if (data.session) {
      await syncSession(data.session);
      await claimReferral();
      window.location.assign(next);
      return;
    }
    // Email confirmation flow — slide back to sign-in with a note.
    onNeedsConfirm("Account created — check your email to confirm, then sign in.");
  };

  return (
    <div className="qx-auth-form">
      <h1 className="qx-auth-h font-display">Create your account</h1>
      <p className="qx-auth-s">Free forever — dynamic QR codes &amp; 185+ tools.</p>

      <GoogleButton next={next} onError={setError} disabled={!active} />
      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required className="qx-auth-input" />
        </label>
        <label className="block">
          <FieldLabel>Password</FieldLabel>
          <PasswordInput value={password} onChange={setPassword} minLength={6} />
        </label>
        <label className="block">
          <FieldLabel>Confirm password</FieldLabel>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
        </label>

        {error && <ErrorNote text={error} />}

        <button type="submit" disabled={loading || !active} className="qx-btn-hero w-full disabled:opacity-60">
          {loading ? "Creating account…" : <>Sign up <FiArrowRight size={15} /></>}
        </button>
      </form>

      <p className="qx-auth-legal">
        By signing up you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <p className="qx-auth-foot">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold" style={{ color: "var(--primary-bright)" }}>
          Sign in
        </button>
      </p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) {
        // keep state awareness, but avoid auto redirect here to prevent loops
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setError("Unable to establish session. Please try again.");
      return;
    }

    // ensure the server has the session cookies so server-side requests
    // (createServerClient with cookies()) can see the authenticated user
    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include credentials so browser accepts Set-Cookie from this response
        credentials: "include",
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
    } catch (err) {
      // non-blocking: still navigate even if sync fails
      console.warn("Failed to sync session to server cookies", err);
    }

    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-cyan-500/20 px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black font-bold">
            Q
          </div>
          <span className="text-2xl font-bold">
            QR<span className="text-cyan-400">ix</span>
          </span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-zinc-900 p-10 shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Login</h1>
          <p className="text-gray-400 mb-8">Access your QRix dashboard and saved QR links.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-black font-semibold hover:bg-cyan-400 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cyan-400 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

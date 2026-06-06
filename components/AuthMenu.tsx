"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function AuthMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    });

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-cyan-500 px-4 py-2 text-black font-semibold"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-cyan-500 px-4 py-2 text-white hover:bg-zinc-900"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="rounded-xl border border-cyan-500/20 bg-zinc-900 px-4 py-2 text-sm text-gray-300">
        Signed in as <span className="text-white">{user.email}</span>
      </div>
      <Link
        href="/dashboard"
        className="rounded-xl bg-cyan-500 px-4 py-2 text-black font-semibold hover:bg-cyan-400"
      >
        Dashboard
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-500"
      >
        Logout
      </button>
    </div>
  );
}

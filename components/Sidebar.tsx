"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Sidebar() {
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

  return (
    <aside className="w-72 min-h-screen bg-zinc-950 border-r border-cyan-500/20 p-6">

      <h2 className="text-3xl font-bold mb-8">
        QR<span className="text-cyan-400">ix</span>
      </h2>

      {user ? (
        <div className="mb-6 rounded-3xl bg-zinc-900 p-4 text-sm text-gray-300">
          <div className="font-semibold text-white mb-2">Signed in as</div>
          <div className="break-words">{user.email}</div>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-3xl bg-zinc-900 p-4 text-sm text-gray-300">
          <div className="font-semibold text-white mb-2">Auth required</div>
          <Link
            href="/login"
            className="block rounded-xl bg-cyan-500 px-4 py-3 text-black text-center font-semibold"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="mt-3 block rounded-xl border border-cyan-500 px-4 py-3 text-center text-white hover:bg-zinc-900"
          >
            Register
          </Link>
        </div>
      )}

      <div className="space-y-8">

        <div>
          <Link href="/dashboard" className="block p-3 rounded-xl hover:bg-zinc-900">
            Dashboard
          </Link>
        </div>

        <div>

          <h3 className="text-cyan-400 text-xs uppercase mb-3">
            QR TOOLS
          </h3>

          <div className="space-y-2">

            <Link href="/url-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              URL QR
            </Link>

            <Link href="/wifi-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              WiFi QR
            </Link>

            <Link href="/whatsapp-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              WhatsApp QR
            </Link>

            <Link href="/email-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              Email QR
            </Link>

            <Link href="/telegram-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              Telegram QR
            </Link>

            <Link href="/sms-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              SMS QR
            </Link>

            <Link href="/vcard-qr" className="block p-3 rounded-xl hover:bg-zinc-900">
              vCard QR
            </Link>

          </div>

        </div>

        <div>

          <h3 className="text-cyan-400 text-xs uppercase mb-3">
            PDF TOOLS
          </h3>

          <Link href="/pdf-tools" className="block p-3 rounded-xl hover:bg-zinc-900">
            PDF Tools
          </Link>

        </div>

        <div>

          <h3 className="text-cyan-400 text-xs uppercase mb-3">
            IMAGE TOOLS
          </h3>

          <Link href="/image-tools" className="block p-3 rounded-xl hover:bg-zinc-900">
            Image Tools
          </Link>

        </div>

      </div>

    </aside>
  );
}
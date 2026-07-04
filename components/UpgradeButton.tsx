"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiZap } from "react-icons/fi";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function UpgradeButton({
  className = "qx-btn-hero",
  label = "Upgrade to Pro",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setMsg(null);
    try {
      // Must be signed in to start checkout.
      const { data: auth } = await supabaseBrowser.auth.getUser();
      if (!auth.user) {
        router.push("/register?next=/pricing");
        return;
      }
      const r = await fetch("/api/billing/checkout", { method: "POST", credentials: "include" });
      const data = await r.json();
      if (data.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setMsg(
        data.error === "billing_not_configured"
          ? "Pro checkout isn’t live yet — coming very soon."
          : "Couldn’t start checkout. Please try again."
      );
    } catch {
      setMsg("Couldn’t start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={go} disabled={loading} className={`${className} disabled:opacity-60`}>
        {loading ? "Starting…" : <><FiZap size={15} /> {label} <FiArrowRight size={15} /></>}
      </button>
      {msg && <p className="text-[12px] mt-2" style={{ color: "var(--text-muted)" }}>{msg}</p>}
    </div>
  );
}

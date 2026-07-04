"use client";

import { useEffect, useState } from "react";
import { FiGift, FiCopy, FiCheck, FiUsers } from "react-icons/fi";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { REFERRAL_REWARD_CREDITS } from "@/lib/entitlements";

export default function InviteCard() {
  const [code, setCode] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [invited, setInvited] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabaseBrowser.auth.getUser();
      if (!auth.user) return;
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("referral_code, credits")
        .eq("id", auth.user.id)
        .single();
      const { count } = await supabaseBrowser
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", auth.user.id);
      if (!active) return;
      if (profile) { setCode(profile.referral_code); setCredits(profile.credits ?? 0); }
      setInvited(count ?? 0);
    })();
    return () => { active = false; };
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = code ? `${origin}/?ref=${code}` : "";

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  return (
    <div className="qx-card p-6 mt-6 relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 90% 30%, rgba(245,143,32,.18), transparent 70%)" }} />
      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4 justify-between">
        <div className="min-w-[240px]">
          <h2 className="qx-title mb-1.5" style={{ color: "var(--text)" }}>
            <FiGift size={16} style={{ color: "var(--primary-bright)" }} /> Invite friends, earn rewards
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            You and your friend each get <b style={{ color: "var(--text)" }}>{REFERRAL_REWARD_CREDITS} credits</b> when they sign up with your link.
          </p>

          <div className="flex items-stretch gap-2 mt-4 max-w-md">
            <input
              readOnly
              value={link || "Loading your link…"}
              onFocus={(e) => e.currentTarget.select()}
              className="qx-auth-input !py-2.5 flex-1 text-[13px]"
            />
            <button onClick={copy} disabled={!link} className="qx-btn-hero !px-4 !py-2.5 disabled:opacity-50">
              {copied ? <><FiCheck size={15} /> Copied</> : <><FiCopy size={15} /> Copy</>}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <Stat icon={<FiUsers size={18} />} label="Friends invited" value={invited} />
          <Stat icon={<FiGift size={18} />} label="Credits earned" value={credits} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2"
        style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}>{icon}</div>
      <div className="font-display text-2xl font-bold leading-none" style={{ color: "var(--text)" }}>{value.toLocaleString()}</div>
      <div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

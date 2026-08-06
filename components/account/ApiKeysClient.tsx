"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiKey, FiCopy, FiCheck, FiTrash2, FiLock, FiTerminal } from "react-icons/fi";

type PublicKey = {
  id: string; name: string; prefix: string; scopes: string[];
  createdAt: string; lastUsedAt: string | null; revokedAt: string | null; requestCount: number;
};
type Plan = { allowed: boolean; reason: "pro" | "owner" | "free"; maxKeys: number };

const SITE = typeof window !== "undefined" ? window.location.origin : "https://qrixtools.com";

export default function ApiKeysClient() {
  const [state, setState] = useState<"loading" | "guest" | "ready">("loading");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [keys, setKeys] = useState<PublicKey[]>([]);
  const [name, setName] = useState("");
  const [scopeWrite, setScopeWrite] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Shown exactly once, held in memory only. A refresh loses it, which is the
     honest behaviour: the server cannot show it again either. */
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/account/api-keys", { cache: "no-store" });
    if (res.status === 401) { setState("guest"); return; }
    const data = await res.json();
    setPlan(data.plan); setKeys(data.keys ?? []); setState("ready");
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function create() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name || "Default key", scopes: scopeWrite ? ["read", "write"] : ["read"] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || "Could not create the key."); return; }
      setFresh(data.key); setName(""); await load();
    } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    setBusy(true);
    try { await fetch(`/api/account/api-keys/${id}`, { method: "DELETE" }); await load(); }
    finally { setBusy(false); }
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const live = keys.filter((k) => !k.revokedAt);

  return (
    <main className="max-w-[900px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
      <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
        // ACCOUNT — API
      </p>
      <h1 className="font-display font-extrabold tracking-tight leading-[1.05] mb-3"
        style={{ color: "var(--text)", fontSize: "clamp(28px, 3.4vw, 42px)" }}>
        API keys
      </h1>
      <p className="text-[14.5px] max-w-xl leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
        Use the QRix API from your own program: render QR codes and create dynamic links
        whose destination you can change without reprinting the code.
      </p>

      {state === "loading" && <p className="text-[13px]" style={{ color: "var(--text-faint)" }}>Loading…</p>}

      {state === "guest" && (
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[14px] mb-4" style={{ color: "var(--text)" }}>Sign in to manage your API keys.</p>
          <Link href="/login" className="qx-btn">Sign in</Link>
        </div>
      )}

      {state === "ready" && plan && !plan.allowed && (
        <div className="rounded-2xl p-6 mb-10" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text)" }}>
            <FiLock size={16} /> <span className="font-bold text-[15px]">API access is part of Pro</span>
          </div>
          <p className="text-[13.5px] mb-5" style={{ color: "var(--text-muted)" }}>
            Your account is on the free plan. Everything on the site stays free to use in the
            browser; the API — programmatic QR rendering and dynamic links — is a Pro feature.
          </p>
          <Link href="/pricing" className="qx-btn">See plans</Link>
        </div>
      )}

      {state === "ready" && plan?.allowed && (
        <>
          {fresh && (
            <div className="rounded-2xl p-5 mb-8" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--surface))", border: "1px solid var(--primary)" }}>
              <p className="font-bold text-[13.5px] mb-1" style={{ color: "var(--text)" }}>Copy your key now</p>
              <p className="text-[12.5px] mb-3" style={{ color: "var(--text-muted)" }}>
                This is the only time it is shown. Only a hash is stored, so it cannot be recovered — if you lose it, revoke it and make another.
              </p>
              <div className="flex items-center gap-2">
                <code className="qx-mono text-[12px] px-3 py-2 rounded-lg flex-1 overflow-x-auto whitespace-nowrap"
                  style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
                  {fresh}
                </code>
                <button onClick={() => copy(fresh)} className="qx-btn !py-2 !px-3" aria-label="Copy key">
                  {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                </button>
              </div>
            </div>
          )}

          <section className="rounded-2xl p-5 mb-10" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex-1 min-w-[200px]">
                <span className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-faint)" }}>Key name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My program"
                  className="w-full rounded-xl px-3 py-2 text-[13.5px]"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
              </label>
              <label className="flex items-center gap-2 text-[13px] pb-2" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={scopeWrite} onChange={(e) => setScopeWrite(e.target.checked)} />
                Allow write (create links)
              </label>
              <button onClick={create} disabled={busy || live.length >= plan.maxKeys} className="qx-btn">
                <FiKey size={14} /> Create key
              </button>
            </div>
            <p className="text-[12px] mt-3" style={{ color: "var(--text-faint)" }}>
              {live.length} of {plan.maxKeys} active keys{plan.reason === "owner" ? " · owner account" : ""}
            </p>
            {error && <p className="text-[12.5px] mt-2" style={{ color: "var(--danger)" }}>{error}</p>}
          </section>

          <section className="mb-12">
            <h2 className="font-display font-bold text-[18px] mb-4" style={{ color: "var(--text)" }}>Your keys</h2>
            {keys.length === 0 && <p className="text-[13px]" style={{ color: "var(--text-faint)" }}>No keys yet.</p>}
            <ul className="space-y-2">
              {keys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: k.revokedAt ? 0.55 : 1 }}>
                  <code className="qx-mono text-[12.5px]" style={{ color: "var(--text)" }}>{k.prefix}…</code>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{k.name}</span>
                  <span className="qx-mono text-[11px]" style={{ color: "var(--text-faint)" }}>{k.scopes.join(" · ")}</span>
                  <span className="qx-mono text-[11px]" style={{ color: "var(--text-faint)" }}>
                    {k.requestCount} req{k.lastUsedAt ? ` · last ${k.lastUsedAt.slice(0, 10)}` : " · never used"}
                  </span>
                  <span className="ml-auto">
                    {k.revokedAt
                      ? <span className="qx-mono text-[11px]" style={{ color: "var(--danger)" }}>revoked</span>
                      : <button onClick={() => revoke(k.id)} disabled={busy} aria-label={`Revoke ${k.name}`}
                          className="qx-btn-ghost !py-1.5 !px-2.5 !text-[12px]"><FiTrash2 size={13} /> Revoke</button>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-[18px] mb-1 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <FiTerminal size={16} /> Using it
            </h2>
            <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
              Send the key as a bearer token. <code className="qx-mono">x-api-key</code> works too.
            </p>
            <pre className="qx-mono text-[12px] p-4 rounded-xl overflow-x-auto"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
{`# a QR code as a PNG
curl -H "Authorization: Bearer YOUR_KEY" \\
  "${SITE}/api/public/v1/qr?content=https://example.com&size=600" \\
  --output qr.png

# a dynamic link you can re-point later, without reprinting the QR
curl -X POST -H "Authorization: Bearer YOUR_KEY" \\
  -H "content-type: application/json" \\
  -d '{"url":"https://example.com/menu"}' \\
  ${SITE}/api/public/v1/links

# your links and their scan counts
curl -H "Authorization: Bearer YOUR_KEY" ${SITE}/api/public/v1/links`}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}

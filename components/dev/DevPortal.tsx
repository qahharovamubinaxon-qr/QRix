"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FiBook, FiKey, FiPlay, FiGitBranch, FiCode, FiCopy, FiPlus, FiTrash2,
  FiRefreshCw, FiZap, FiCheckCircle, FiSend,
} from "react-icons/fi";

/* QRix developer portal: docs · API keys · webhooks · playground · SDKs.
   Renders the endpoint reference straight from /api/v1/openapi.json. */

type Json = Record<string, unknown>;
const api = async (url: string, init?: RequestInit): Promise<{ ok: boolean; data?: unknown; status: number }> => {
  try {
    const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok && j.ok !== false, data: j.data ?? j, status: r.status };
  } catch { return { ok: false, status: 0 }; }
};

const TABS = [
  { id: "docs", label: "Documentation", icon: <FiBook size={14} /> },
  { id: "keys", label: "API Keys", icon: <FiKey size={14} /> },
  { id: "webhooks", label: "Webhooks", icon: <FiGitBranch size={14} /> },
  { id: "playground", label: "Playground", icon: <FiPlay size={14} /> },
  { id: "sdk", label: "SDKs", icon: <FiCode size={14} /> },
] as const;

const SNIPPETS: Record<string, string> = {
  "JavaScript": `import QRix from "https://qrix.app/sdk/qrix.js";

const qrix = new QRix("qrix_live_YOUR_KEY");
const job = await qrix.createJob("AI", "summarizer", { prompt: "Hello QRix" });
const done = await qrix.waitForJob(job.id);
console.log(done.output);`,
  "TypeScript": `// npm: copy sdk/qrix.js into your project (ships types via JSDoc)
import QRix from "./qrix.js";

const qrix = new QRix(process.env.QRIX_API_KEY!);
const me = await qrix.me();
console.log(me.profile.email, me.quota);`,
  "Python": `import requests

API = "https://qrix.app/api/v1"
HEADERS = {"Authorization": "Bearer qrix_live_YOUR_KEY"}

job = requests.post(f"{API}/jobs", json={
    "kind": "AI", "tool": "summarizer",
    "input": {"prompt": "Hello QRix"},
}, headers=HEADERS).json()["data"]

status = requests.get(f"{API}/jobs/{job['id']}", headers=HEADERS).json()
print(status["data"]["output"])`,
  "PHP": `<?php
$ch = curl_init("https://qrix.app/api/v1/jobs");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer qrix_live_YOUR_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "kind" => "AI", "tool" => "summarizer",
    "input" => ["prompt" => "Hello QRix"],
  ]),
]);
$job = json_decode(curl_exec($ch), true)["data"];
echo $job["id"];`,
  "cURL": `curl -X POST https://qrix.app/api/v1/jobs \\
  -H "Authorization: Bearer qrix_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"kind":"AI","tool":"summarizer","input":{"prompt":"Hello QRix"}}'

# poll
curl https://qrix.app/api/v1/jobs/JOB_ID \\
  -H "Authorization: Bearer qrix_live_YOUR_KEY"`,
};

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#0d0d12", border: "1px solid var(--border)" }}>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-[11px]" style={{ background: "rgba(255,255,255,.06)", color: copied ? "#22c55e" : "#9a9ab0" }}>
        {copied ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
      </button>
      <pre className="p-4 text-[12px] leading-relaxed overflow-x-auto" style={{ color: "#d7d7e2" }}><code>{children}</code></pre>
    </div>
  );
}

export default function DevPortal() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("docs");
  const [spec, setSpec] = useState<Json | null>(null);
  const [keys, setKeys] = useState<Json[]>([]);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [hooks, setHooks] = useState<Json | null>(null);
  const [freshSecret, setFreshSecret] = useState<string | null>(null);
  const [sdkLang, setSdkLang] = useState("JavaScript");
  // playground
  const [pgMethod, setPgMethod] = useState("GET");
  const [pgPath, setPgPath] = useState("/me/credits");
  const [pgKey, setPgKey] = useState("");
  const [pgBody, setPgBody] = useState('{\n  "kind": "AI",\n  "tool": "summarizer",\n  "input": { "prompt": "Hello" }\n}');
  const [pgOut, setPgOut] = useState<string>("");

  useEffect(() => { api("/api/v1/openapi.json").then((r) => setSpec(r.data as Json)); }, []);
  const loadKeys = useCallback(() => api("/api/v1/keys").then((r) => setKeys((r.data as Json[]) || [])), []);
  const loadHooks = useCallback(() => api("/api/v1/webhooks").then((r) => setHooks((r.data as Json) || null)), []);
  useEffect(() => { if (tab === "keys") loadKeys(); if (tab === "webhooks") loadHooks(); }, [tab, loadKeys, loadHooks]);

  const runPlayground = async () => {
    setPgOut("…");
    const t0 = Date.now();
    try {
      const init: RequestInit = { method: pgMethod, headers: { "Content-Type": "application/json", ...(pgKey ? { Authorization: `Bearer ${pgKey}` } : {}) } };
      if (pgMethod !== "GET" && pgBody.trim()) init.body = pgBody;
      const r = await fetch(`/api/v1${pgPath.startsWith("/") ? pgPath : `/${pgPath}`}`, init);
      const text = await r.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      setPgOut(`HTTP ${r.status} · ${Date.now() - t0}ms\n\n${pretty}`);
    } catch (e) {
      setPgOut(`Request failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const paths = (spec?.paths as Record<string, Record<string, { summary?: string; tags?: string[] }>>) || {};

  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8" data-reveal>
        <span className="qx-badge-hero inline-flex mb-4"><span className="qx-badge-hero-dot" />Developer Platform</span>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>Build with the QRix API</h1>
        <p className="text-[15px] mt-2 max-w-xl" style={{ color: "var(--text-muted)" }}>
          REST API, webhooks and SDKs for jobs, AI processing, storage, credits and workspaces. Versioned under <code>/api/v1</code>.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-colors"
            style={tab === t.id ? { background: "var(--grad-primary)", color: "#0b0b0b" } : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "docs" && (
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 items-start">
          <div className="space-y-3">
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Quick start</p>
              <ol className="text-[13px] space-y-1.5 list-decimal list-inside" style={{ color: "var(--text-muted)" }}>
                <li>Create an API key (Keys tab)</li>
                <li>Send it as <code>Authorization: Bearer</code></li>
                <li>POST <code>/jobs</code>, poll <code>/jobs/:id</code></li>
              </ol>
            </div>
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Authentication</p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Keys are scoped (<b>read</b>/<b>write</b>), can expire, and are shown once. Rotate anytime — old key dies instantly.</p>
            </div>
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Rate limits</p>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>60 req/min per key (jobs 30, uploads 20). Per-workspace limits via <code>X-Workspace-Id</code>. Watch <code>X-RateLimit-Remaining</code>.</p>
            </div>
            <div className="qx-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Error codes</p>
              {Object.entries((spec?.["x-error-codes"] as Record<string, number>) || {}).map(([code, status]) => (
                <div key={code} className="flex justify-between text-[12px] py-1" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <code>{code}</code><span>{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="qx-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Endpoint reference · OpenAPI 3.1</p>
              <a href="/api/v1/openapi.json" target="_blank" className="text-[11px] font-bold" style={{ color: "var(--primary-bright)" }}>openapi.json ↗</a>
            </div>
            {Object.entries(paths).map(([path, methods]) => (
              <div key={path} className="py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                {Object.entries(methods).map(([method, op]) => (
                  <div key={method} className="flex items-center gap-3 py-1">
                    <span className="text-[10px] font-extrabold w-14 text-center py-0.5 rounded uppercase"
                      style={{ background: method === "get" ? "rgba(34,197,94,.12)" : method === "delete" ? "rgba(248,113,113,.12)" : "rgba(187,169,255,.14)", color: method === "get" ? "#22c55e" : method === "delete" ? "#f87171" : "#bba9ff" }}>{method}</span>
                    <code className="text-[12.5px]" style={{ color: "var(--text)" }}>{path}</code>
                    <span className="text-[12px] truncate" style={{ color: "var(--text-muted)" }}>{op.summary}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "keys" && (
        <div className="max-w-2xl">
          {freshKey && (
            <div className="qx-card p-4 mb-4" style={{ borderColor: "var(--primary)" }}>
              <p className="text-[12px] font-bold mb-1" style={{ color: "var(--text)" }}>Your new key — copy it now, it will not be shown again:</p>
              <Code>{freshKey}</Code>
            </div>
          )}
          <button onClick={async () => {
            const name = prompt("Key name?", "My integration");
            if (!name) return;
            const r = await api("/api/v1/keys", { method: "POST", body: JSON.stringify({ name, scopes: "read,write" }) });
            const d = r.data as Json;
            if (d?.key) { setFreshKey(String(d.key)); loadKeys(); }
            else alert("Sign in first — keys belong to your account.");
          }} className="qx-btn !py-2.5 !px-4 text-[13px] font-bold mb-4 inline-flex items-center gap-2"><FiPlus size={14} /> Create key</button>
          {keys.map((k) => (
            <div key={String(k.id)} className="qx-card p-4 mb-2 flex items-center gap-3 flex-wrap">
              <FiKey size={14} style={{ color: k.revoked ? "var(--text-faint)" : "var(--primary-bright)" }} />
              <div className="min-w-0">
                <p className="text-[13px] font-bold" style={{ color: "var(--text)", textDecoration: k.revoked ? "line-through" : "none" }}>{String(k.name)}</p>
                <p className="text-[11px]" style={{ color: "var(--text-faint)" }}><code>{String(k.prefix)}…</code> · {(k.scopes as string[]).join(",")} · {String(k.requests)} requests</p>
              </div>
              <span className="flex-1" />
              <button title="Rotate" className="p-2" style={{ color: "var(--text-muted)" }} onClick={async () => {
                const r = await api(`/api/v1/keys/${k.id}`, { method: "PUT" });
                const d = r.data as Json;
                if (d?.key) { setFreshKey(String(d.key)); loadKeys(); }
              }}><FiRefreshCw size={13} /></button>
              <button title="Delete" className="p-2" style={{ color: "#f87171" }} onClick={async () => {
                if (confirm("Delete key?")) { await api(`/api/v1/keys/${k.id}`, { method: "DELETE" }); loadKeys(); }
              }}><FiTrash2 size={13} /></button>
            </div>
          ))}
          {!keys.length && <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>No keys yet. Sign in and create one to call the API.</p>}
        </div>
      )}

      {tab === "webhooks" && (
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div>
            {freshSecret && (
              <div className="qx-card p-4 mb-4" style={{ borderColor: "var(--primary)" }}>
                <p className="text-[12px] font-bold mb-1" style={{ color: "var(--text)" }}>Signing secret — shown once:</p>
                <Code>{freshSecret}</Code>
              </div>
            )}
            <form className="qx-card p-5 mb-4" onSubmit={async (e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const url = (f.elements.namedItem("wu") as HTMLInputElement).value.trim();
              if (!url) return;
              const r = await api("/api/v1/webhooks", { method: "POST", body: JSON.stringify({ url }) });
              const d = r.data as Json;
              if (d?.secret) { setFreshSecret(String(d.secret)); loadHooks(); f.reset(); }
              else alert("Sign in first.");
            }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Register endpoint</p>
              <div className="flex gap-2">
                <input name="wu" placeholder="https://example.com/webhooks/qrix" className="flex-1 px-3 py-2.5 rounded-xl text-[13px] outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <button className="qx-btn !py-2.5 !px-4 text-[13px] font-bold"><FiPlus size={13} /></button>
              </div>
              <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
                Events: {((hooks?.events as string[]) || []).join(" · ") || "job.completed, payment.succeeded, …"}. Verify via <code>X-QRix-Signature</code>.
              </p>
            </form>
            {((hooks?.webhooks as Json[]) || []).map((w) => (
              <div key={String(w.id)} className="qx-card p-4 mb-2 flex items-center gap-3 flex-wrap">
                <FiZap size={13} style={{ color: w.active ? "#22c55e" : "var(--text-faint)" }} />
                <code className="text-[12px] truncate max-w-[220px]" style={{ color: "var(--text)" }}>{String(w.url)}</code>
                <span className="flex-1" />
                <button className="text-[11px] font-bold inline-flex items-center gap-1" style={{ color: "var(--primary-bright)" }}
                  onClick={async () => { await api(`/api/v1/webhooks/${w.id}`, { method: "POST", body: JSON.stringify({ test: true }) }); setTimeout(loadHooks, 1200); }}>
                  <FiSend size={11} /> Test
                </button>
                <button className="text-[11px] font-bold" style={{ color: "#f87171" }}
                  onClick={async () => { await api(`/api/v1/webhooks/${w.id}`, { method: "DELETE" }); loadHooks(); }}><FiTrash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="qx-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Recent deliveries</p>
            {((hooks?.deliveries as Json[]) || []).map((d) => (
              <div key={String(d.id)} className="flex items-center gap-2 py-1.5 text-[12px]" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: d.status === "success" ? "#22c55e" : d.status === "failed" ? "#f87171" : "#fbbf24" }}>●</span>
                <code style={{ color: "var(--text)" }}>{String(d.event)}</code>
                <span style={{ color: "var(--text-faint)" }}>{d.httpStatus ? `HTTP ${d.httpStatus}` : ""} · {String(d.attempts)} attempt(s)</span>
              </div>
            ))}
            {!((hooks?.deliveries as Json[]) || []).length && <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>No deliveries yet.</p>}
          </div>
        </div>
      )}

      {tab === "playground" && (
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="qx-card p-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Request builder</p>
            <div className="flex gap-2">
              <select value={pgMethod} onChange={(e) => setPgMethod(e.target.value)} className="px-3 py-2.5 rounded-xl text-[13px] font-bold" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
              </select>
              <input value={pgPath} onChange={(e) => setPgPath(e.target.value)} placeholder="/me/credits" className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-mono outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </div>
            <input value={pgKey} onChange={(e) => setPgKey(e.target.value)} type="password" placeholder="qrix_live_… (optional — session auth used otherwise)" className="w-full px-3 py-2.5 rounded-xl text-[12px] font-mono outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            {pgMethod !== "GET" && (
              <textarea value={pgBody} onChange={(e) => setPgBody(e.target.value)} rows={7} className="w-full px-3 py-2.5 rounded-xl text-[12px] font-mono outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            )}
            <button onClick={runPlayground} className="qx-btn w-full !py-2.5 text-[13px] font-bold inline-flex items-center justify-center gap-2"><FiPlay size={13} /> Send request</button>
          </div>
          <div className="qx-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Response</p>
            <pre className="text-[12px] leading-relaxed overflow-x-auto whitespace-pre-wrap min-h-[200px]" style={{ color: "var(--text)" }}>{pgOut || "Send a request to see the response."}</pre>
          </div>
        </div>
      )}

      {tab === "sdk" && (
        <div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {Object.keys(SNIPPETS).map((l) => (
              <button key={l} onClick={() => setSdkLang(l)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
                style={sdkLang === l ? { background: "var(--grad-primary)", color: "#0b0b0b" } : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{l}</button>
            ))}
            <span className="flex-1" />
            <a href="/sdk/qrix.js" download className="text-[12px] font-bold self-center" style={{ color: "var(--primary-bright)" }}>Download qrix.js ↓</a>
          </div>
          <Code>{SNIPPETS[sdkLang]}</Code>
        </div>
      )}
    </main>
  );
}

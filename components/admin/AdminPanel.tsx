"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiUsers, FiCreditCard, FiFileText, FiFlag, FiList, FiActivity,
  FiCpu, FiSearch, FiRefreshCw, FiTrendingUp, FiHardDrive, FiKey, FiZap, FiMail, FiSliders,
} from "react-icons/fi";

/* QRix admin dashboard — client shell over /api/v1/admin/{section}.
   RBAC lives on the server; this UI only renders what the API allows. */

type Json = Record<string, unknown>;
const fetchJson = async (url: string, init?: RequestInit): Promise<Json | null> => {
  try {
    const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const j = await r.json();
    return r.ok && j.ok ? (j.data as Json) : null;
  } catch { return null; }
};

const TABS = [
  { id: "overview", label: "Overview", icon: <FiActivity size={14} /> },
  { id: "users", label: "Users", icon: <FiUsers size={14} /> },
  { id: "subscriptions", label: "Subscriptions", icon: <FiTrendingUp size={14} /> },
  { id: "payments", label: "Payments", icon: <FiCreditCard size={14} /> },
  { id: "posts", label: "Articles", icon: <FiFileText size={14} /> },
  { id: "tools", label: "Tools", icon: <FiZap size={14} /> },
  { id: "ai-providers", label: "AI", icon: <FiSliders size={14} /> },
  { id: "flags", label: "Flags", icon: <FiFlag size={14} /> },
  { id: "logs", label: "Logs", icon: <FiList size={14} /> },
  { id: "status", label: "System", icon: <FiCpu size={14} /> },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── tiny SVG area chart (GPU-cheap, zero deps) ── */
function AreaChart({ data, color = "var(--primary-bright)" }: { data: { date: string; value: number }[]; color?: string }) {
  const d = useMemo(() => {
    if (!data.length) return { path: "", area: "", max: 0 };
    const max = Math.max(...data.map((p) => p.value), 1);
    const pts = data.map((p, i) => [ (i / (data.length - 1)) * 300, 80 - (p.value / max) * 72 ]);
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
    return { path, area: `${path}L300,80L0,80Z`, max };
  }, [data]);
  return (
    <svg viewBox="0 0 300 84" className="w-full h-20" preserveAspectRatio="none" aria-hidden>
      <path d={d.area} fill={color} opacity={0.12} />
      <path d={d.path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="qx-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</p>
      <p className="font-display text-2xl font-extrabold mt-1" style={{ color: "var(--text)" }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="qx-card overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {cols.map((c) => <th key={c} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length} className="px-4 py-6 text-center" style={{ color: "var(--text-muted)" }}>No records</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              {r.map((cell, j) => <td key={j} className="px-4 py-2.5 align-middle" style={{ color: j === 0 ? "var(--text)" : "var(--text-muted)" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Badge = ({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "good" | "warn" | "bad" }) => (
  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
    style={{
      background: tone === "good" ? "rgba(34,197,94,.12)" : tone === "warn" ? "rgba(251,191,36,.12)" : tone === "bad" ? "rgba(248,113,113,.12)" : "var(--surface-hover)",
      color: tone === "good" ? "#22c55e" : tone === "warn" ? "#fbbf24" : tone === "bad" ? "#f87171" : "var(--text-muted)",
    }}>{children}</span>
);

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");
const fmtMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtBytes = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

export default function AdminPanel() {
  const [me, setMe] = useState<{ email: string; role: string } | null | undefined>(undefined);
  const [tab, setTab] = useState<TabId>("overview");
  const [q, setQ] = useState("");
  const [data, setData] = useState<Json | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchJson("/api/v1/auth/session").then((d) => setMe((d?.user as { email: string; role: string }) ?? null));
  }, []);

  const load = useCallback(async (t: TabId, query: string) => {
    setLoading(true);
    const d = await fetchJson(`/api/v1/admin/${t}?limit=25${query ? `&q=${encodeURIComponent(query)}` : ""}`);
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (me?.role === "ADMIN") load(tab, q);
  }, [me, tab, q, load]);

  const mutate = useCallback(async (section: string, body: Json) => {
    await fetchJson(`/api/v1/admin/${section}`, { method: "POST", body: JSON.stringify(body) });
    load(tab, q);
  }, [load, tab, q]);

  /* ── gates ── */
  if (me === undefined) return <main className="max-w-6xl mx-auto px-5 py-24 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading…</main>;
  if (!me || me.role !== "ADMIN") {
    return (
      <main className="max-w-md mx-auto px-5 py-24">
        <div className="qx-card p-8 text-center">
          <FiMail size={22} className="mx-auto mb-3" style={{ color: "var(--primary-bright)" }} />
          <h1 className="font-display text-xl font-extrabold" style={{ color: "var(--text)" }}>Admin access</h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            {me ? `Signed in as ${me.email} — this account is not an admin.` : "Sign in with an admin email via magic link."}
          </p>
          {!me && (magicSent ? (
            <p className="text-sm mt-4 font-semibold" style={{ color: "var(--primary-bright)" }}>Link sent — check the server console (mock email driver) or your inbox.</p>
          ) : (
            <form className="mt-5 flex gap-2" onSubmit={async (e) => {
              e.preventDefault();
              const ok = await fetchJson("/api/v1/auth/magic", { method: "POST", body: JSON.stringify({ email }) });
              if (ok) setMagicSent(true);
            }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="admin@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
              <button className="qx-btn !py-2.5 !px-4 text-[13px] font-bold">Send link</button>
            </form>
          ))}
        </div>
      </main>
    );
  }

  /* ── panel ── */
  const items = (data?.items as Json[]) || [];
  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <h1 className="font-display text-2xl font-extrabold" style={{ color: "var(--text)" }}>Admin</h1>
        <span className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <FiSearch size={13} style={{ color: "var(--text-faint)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="bg-transparent outline-none text-[13px] w-40" style={{ color: "var(--text)" }} />
        </div>
        <button onClick={() => load(tab, q)} className="qx-btn-ghost !p-2.5" title="Refresh"><FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /></button>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setQ(""); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-bold transition-colors"
            style={tab === t.id
              ? { background: "var(--grad-primary)", color: "#0b0b0b" }
              : { background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Stat label="Users" value={String(data.users)} sub={`${data.pro} paid`} />
            <Stat label="DAU / MAU" value={`${data.dau} / ${data.mau}`} />
            <Stat label="MRR" value={fmtMoney(Number(data.mrr || 0))} sub={`${data.activeSubs} active subs`} />
            <Stat label="Revenue" value={fmtMoney(Number(data.revenue || 0))} sub={`${data.conversionRate}% conversion`} />
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {(["signups", "toolUse", "downloads"] as const).map((k, i) => (
              <div key={k} className="qx-card p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{k === "toolUse" ? "Tool usage" : k} · 30d</p>
                <AreaChart data={(data[k] as { date: string; value: number }[]) || []} color={["#e1ff04", "#bba9ff", "#22d3ee"][i]} />
              </div>
            ))}
          </div>
          <Table cols={["Tool", "Uses (30d)"]}
            rows={((data.topTools as { tool: string; count: number }[]) || []).map((t) => [t.tool, t.count])} />
        </>
      )}

      {tab === "users" && (
        <Table cols={["Email", "Name", "Plan", "Role", "Joined", ""]}
          rows={items.map((u) => [
            String(u.email), String(u.name || "—"),
            <Badge key="p" tone={u.plan === "FREE" ? "default" : "good"}>{String(u.plan)}</Badge>,
            <Badge key="r" tone={u.role === "ADMIN" ? "warn" : "default"}>{String(u.role)}</Badge>,
            fmtDate(String(u.createdAt)),
            <button key="a" className="text-[11px] font-bold" style={{ color: "var(--primary-bright)" }}
              onClick={() => mutate("users", { id: u.id, plan: u.plan === "FREE" ? "PRO" : "FREE" })}>
              {u.plan === "FREE" ? "Grant Pro" : "Set Free"}
            </button>,
          ])} />
      )}

      {tab === "subscriptions" && (
        <Table cols={["User", "Plan", "Status", "Interval", "Renews", "Trial ends"]}
          rows={items.map((s) => [
            String(s.userId), String(s.plan),
            <Badge key="s" tone={s.status === "ACTIVE" ? "good" : s.status === "TRIALING" ? "warn" : "bad"}>{String(s.status)}</Badge>,
            String(s.interval), fmtDate(s.currentPeriodEnd as string), fmtDate(s.trialEnd as string),
          ])} />
      )}

      {tab === "payments" && (
        <Table cols={["Order", "User", "Amount", "Status", "Coupon", "Date"]}
          rows={items.map((o) => [
            String(o.id), String(o.userId), fmtMoney(Number(o.amount)),
            <Badge key="s" tone={o.status === "paid" ? "good" : "bad"}>{String(o.status)}</Badge>,
            String(o.couponCode || "—"), fmtDate(String(o.createdAt)),
          ])} />
      )}

      {tab === "posts" && (
        <Table cols={["Title", "Category", "Status", "Featured", "Published", ""]}
          rows={items.map((p) => [
            <span key="t" className="line-clamp-1 max-w-[280px] inline-block">{String(p.title)}</span>,
            String(p.category || "—"),
            <Badge key="s" tone={p.status === "published" ? "good" : "warn"}>{String(p.status)}</Badge>,
            <button key="f" onClick={() => mutate("posts", { id: p.id, featured: !p.featured })} className="text-[13px]">{p.featured ? "★" : "☆"}</button>,
            fmtDate(p.publishedAt as string),
            <button key="a" className="text-[11px] font-bold" style={{ color: "var(--primary-bright)" }}
              onClick={() => mutate("posts", { id: p.id, status: p.status === "published" ? "draft" : "published" })}>
              {p.status === "published" ? "Unpublish" : "Publish"}
            </button>,
          ])} />
      )}

      {tab === "tools" && (
        <Table cols={["Tool", "Uses (90d)"]} rows={items.map((t) => [String(t.tool), Number(t.count)])} />
      )}

      {tab === "ai-providers" && Array.isArray(data) && (
        <div className="grid md:grid-cols-2 gap-3">
          {(data as unknown as Json[]).map((p) => (
            <div key={String(p.id)} className="qx-card p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-extrabold text-[15px]" style={{ color: "var(--text)" }}>{String(p.name)}</span>
                {!!p.free && <Badge tone="good">free</Badge>}
                {!!p.primary && <Badge tone="warn">primary</Badge>}
                {!!p.backup && <Badge>backup</Badge>}
                {!!p.coolingDown && <Badge tone="bad">cooldown</Badge>}
                <span className="flex-1" />
                <Badge tone={p.hasKey ? "good" : "default"}>{p.hasKey ? `key: ${p.keySource}` : "no key"}</Badge>
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>{(p.capabilities as string[]).join(" · ")}</p>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                {[
                  ["Success", p.successRate === null ? "—" : `${p.successRate}%`],
                  ["Avg latency", p.avgLatencyMs === null ? "—" : `${p.avgLatencyMs}ms`],
                  ["Today", String(p.dailyRequests ?? 0)],
                  ["Tokens", String(p.tokens ?? 0)],
                  ["Est. cost", `$${Number(p.costUsd || 0).toFixed(4)}`],
                  ["Rate-limited", String(p.rateLimited ?? 0)],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg py-1.5" style={{ background: "var(--surface-2)" }}>
                    <p className="text-[9px] font-bold uppercase" style={{ color: "var(--text-faint)" }}>{l}</p>
                    <p className="text-[12px] font-bold" style={{ color: "var(--text)" }}>{v}</p>
                  </div>
                ))}
              </div>

              {!!(p.lastRequestAt || p.lastError) && (
                <p className="text-[11px] mt-2 line-clamp-1" style={{ color: p.lastError ? "#f87171" : "var(--text-muted)" }}>
                  {p.lastError ? `Last error: ${p.lastError}` : `Last request: ${new Date(String(p.lastRequestAt)).toLocaleTimeString()}`}
                </p>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button onClick={() => mutate("ai-providers", { id: p.id, enabled: !p.enabled })}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg"
                  style={p.enabled ? { background: "rgba(34,197,94,.12)", color: "#22c55e" } : { background: "var(--surface-2)", color: "var(--text-faint)" }}>
                  {p.enabled ? "Enabled" : "Disabled"}
                </button>
                <button onClick={() => mutate("ai-providers", { id: p.id, primary: !p.primary })} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: "var(--surface-2)", color: p.primary ? "var(--primary-bright)" : "var(--text-muted)" }}>Primary</button>
                <button onClick={() => mutate("ai-providers", { id: p.id, backup: !p.backup })} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: "var(--surface-2)", color: p.backup ? "var(--primary-bright)" : "var(--text-muted)" }}>Backup</button>
                <form className="flex-1 min-w-[180px] flex gap-1.5" onSubmit={(e) => {
                  e.preventDefault();
                  const inp = (e.currentTarget.elements.namedItem("k") as HTMLInputElement);
                  if (inp.value.trim()) { mutate("ai-providers", { id: p.id, apiKey: inp.value.trim() }); inp.value = ""; }
                }}>
                  <input name="k" type="password" placeholder="Set API key…" autoComplete="off"
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-[11px] outline-none"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  <button className="text-[11px] font-bold px-2.5 rounded-lg" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>Save</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "flags" && Array.isArray(data) && (
        <Table cols={["Flag", "Enabled", "Rollout", ""]}
          rows={(data as unknown as Json[]).map((f) => [
            String(f.key),
            <Badge key="e" tone={f.enabled ? "good" : "default"}>{f.enabled ? "on" : "off"}</Badge>,
            `${f.rollout}%`,
            <button key="a" className="text-[11px] font-bold" style={{ color: "var(--primary-bright)" }}
              onClick={() => mutate("flags", { key: f.key, enabled: !f.enabled, rollout: f.enabled ? 0 : 100 })}>Toggle</button>,
          ])} />
      )}

      {tab === "logs" && (
        <Table cols={["Action", "Actor", "Target", "IP", "When"]}
          rows={items.map((l) => [String(l.action), String(l.actorId || "—"), String(l.target || "—"), String(l.ip || "—"), fmtDate(String(l.createdAt))])} />
      )}

      {tab === "status" && data && (
        <div className="grid md:grid-cols-2 gap-3">
          <div className="qx-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Drivers</p>
            {Object.entries((data.drivers as Record<string, string>) || {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 text-[13px]" style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text)" }} className="font-semibold capitalize">{k}</span>
                <Badge tone={["mock", "memory", "console", "local"].includes(v) ? "warn" : "good"}>{v}</Badge>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-4 text-[12px]" style={{ color: "var(--text-muted)" }}>
              <FiHardDrive size={13} /> {String((data.storage as Json)?.uploads)} uploads · {fmtBytes(Number((data.storage as Json)?.bytes || 0))}
              <span className="mx-1">·</span>
              <FiKey size={13} /> {String((data.apiUsage as Json)?.keys)} keys · {String((data.apiUsage as Json)?.requests)} requests
            </div>
          </div>
          <div className="qx-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Processing providers</p>
            {(["ai", "video", "image"] as const).map((kind) => (
              <div key={kind} className="mb-3">
                <p className="text-[11px] font-bold uppercase mb-1" style={{ color: "var(--text-muted)" }}>{kind}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(((data.providers as Json)?.[kind] as { name: string; ready: boolean; active: boolean }[]) || []).map((p) => (
                    <span key={p.name} className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                      style={{
                        background: p.active ? "var(--grad-primary)" : "var(--surface-2)",
                        color: p.active ? "#0b0b0b" : p.ready ? "var(--text)" : "var(--text-faint)",
                        border: "1px solid var(--border)",
                      }}>{p.name}{p.ready ? "" : " ○"}</span>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => mutate("cleanup", {})} className="qx-btn-ghost !py-2 !px-3 text-[12px] font-bold mt-2">Purge expired uploads</button>
          </div>
        </div>
      )}
    </main>
  );
}

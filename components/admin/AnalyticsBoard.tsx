"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiDownload, FiRefreshCw, FiActivity } from "react-icons/fi";

/* Enterprise analytics board — admin-only, rendered inside AdminPanel.
   All charts are dependency-free SVG (GPU-cheap, theme-aware). */

type Json = Record<string, unknown>;
type Pt = { date: string; value: number };
type Kv = { name: string; value: number };

const COLORS = ["#e1ff04", "#bba9ff", "#22d3ee", "#f87171", "#4ade80", "#fbbf24", "#f472b6", "#94a3b8"];
const FLAGS: Record<string, string> = { US: "🇺🇸", DE: "🇩🇪", UZ: "🇺🇿", RU: "🇷🇺", IN: "🇮🇳", BR: "🇧🇷", GB: "🇬🇧", JP: "🇯🇵", FR: "🇫🇷", TR: "🇹🇷", "??": "🌐" };

function Area({ data, color = COLORS[0] }: { data: Pt[]; color?: string }) {
  const d = useMemo(() => {
    if (!data?.length) return { path: "", area: "" };
    const max = Math.max(...data.map((p) => p.value), 1);
    const pts = data.map((p, i) => [(i / Math.max(1, data.length - 1)) * 300, 80 - (p.value / max) * 72]);
    const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
    return { path, area: `${path}L300,80L0,80Z` };
  }, [data]);
  return (
    <svg viewBox="0 0 300 84" className="w-full h-20" preserveAspectRatio="none" aria-hidden>
      <path d={d.area} fill={color} opacity={0.12} />
      <path d={d.path} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

function Bars({ data, color = COLORS[1] }: { data: Kv[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2 text-[12px]">
          <span className="w-24 truncate" style={{ color: "var(--text)" }}>{FLAGS[d.name] ? `${FLAGS[d.name]} ${d.name}` : d.name}</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color, transition: "width .4s" }} />
          </div>
          <span className="w-10 text-right" style={{ color: "var(--text-muted)" }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data }: { data: Kv[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 42 42" className="w-24 h-24 shrink-0" aria-hidden>
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = `${frac * 100} ${100 - frac * 100}`;
          const el = <circle key={d.name} r="15.9" cx="21" cy="21" fill="none" strokeWidth="6"
            stroke={COLORS[i % COLORS.length]} strokeDasharray={dash} strokeDashoffset={-acc * 100 + 25} />;
          acc += frac;
          return el;
        })}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name} · {Math.round((d.value / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(...grid.flat(), 1);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: "28px repeat(24, minmax(8px, 1fr))", minWidth: 420 }}>
        {grid.map((row, d) => (
          [<span key={`l${d}`} className="text-[9px] pr-1 text-right" style={{ color: "var(--text-faint)" }}>{days[d]}</span>,
          ...row.map((v, h) => (
            <div key={`${d}-${h}`} title={`${days[d]} ${h}:00 — ${v}`} className="aspect-square rounded-[2px]"
              style={{ background: v ? `color-mix(in srgb, #e1ff04 ${Math.round((v / max) * 85) + 15}%, var(--surface-2))` : "var(--surface-2)" }} />
          ))]
        ))}
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: { stage: string; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-1.5">
      {steps.map((s, i) => (
        <div key={s.stage} className="flex items-center gap-2 text-[12px]">
          <span className="w-20 truncate" style={{ color: "var(--text)" }}>{s.stage}</span>
          <div className="flex-1 flex justify-center">
            <div className="h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
              style={{ width: `${Math.max(8, (s.value / max) * 100)}%`, background: `color-mix(in srgb, ${COLORS[i % COLORS.length]} 30%, var(--surface-2))`, color: "var(--text)", transition: "width .4s" }}>
              {s.value}
            </div>
          </div>
          <span className="w-12 text-right" style={{ color: "var(--text-faint)" }}>
            {i ? `${Math.round((s.value / (steps[i - 1].value || 1)) * 100)}%` : "100%"}
          </span>
        </div>
      ))}
    </div>
  );
}

const RANGES = [{ d: 1, l: "24h" }, { d: 7, l: "Week" }, { d: 30, l: "Month" }, { d: 365, l: "Year" }];

export default function AnalyticsBoard() {
  const [days, setDays] = useState(30);
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [plan, setPlan] = useState("");
  const [data, setData] = useState<Json | null>(null);
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams({ days: String(days) });
    if (country) p.set("country", country);
    if (device) p.set("device", device);
    if (plan) p.set("plan", plan);
    return p.toString();
  }, [days, country, device, plan]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/admin/analytics?${qs}`);
      const j = await r.json();
      if (j.ok) setData(j.data as Json);
    } finally { setLoading(false); }
  }, [qs]);

  useEffect(() => { load(); }, [load]);
  // Realtime pulse — refresh the headline every 15s.
  useEffect(() => { const t = setInterval(load, 15_000); return () => clearInterval(t); }, [load]);

  const h = (data?.headline as Json) || {};
  const s = (data?.series as Record<string, Pt[]>) || {};
  const b = (data?.breakdown as Record<string, Kv[]>) || {};
  const sel = (v: string, set: (x: string) => void, opts: string[], label: string) => (
    <select value={v} onChange={(e) => set(e.target.value)} aria-label={label}
      className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
      <option value="">{label}</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div>
      {/* Filters + exports */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {RANGES.map((r) => (
            <button key={r.d} onClick={() => setDays(r.d)} className="px-3 py-1.5 text-[12px] font-bold"
              style={days === r.d ? { background: "var(--grad-primary)", color: "#0b0b0b" } : { background: "var(--surface)", color: "var(--text-muted)" }}>{r.l}</button>
          ))}
        </div>
        {sel(country, setCountry, ["US", "DE", "UZ", "RU", "IN", "BR", "GB", "JP", "FR", "TR"], "Country")}
        {sel(device, setDevice, ["desktop", "mobile", "tablet"], "Device")}
        {sel(plan, setPlan, ["FREE", "PRO", "BUSINESS", "ENTERPRISE"], "Plan")}
        <span className="flex-1" />
        {["csv", "excel", "pdf", "json"].map((f) => (
          <a key={f} href={`/api/v1/admin/analytics?${qs}&format=${f}`} download
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <FiDownload size={11} /> {f}
          </a>
        ))}
        <button onClick={load} className="qx-btn-ghost !p-2" title="Refresh"><FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /></button>
      </div>

      {/* Headline */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        {[
          ["Visitors", h.visitors], ["Sessions", h.sessions], ["Users", h.users],
          ["Tool uses", h.toolUses], ["Downloads", h.downloads], ["Uploads", h.uploads],
          ["Conversions", h.conversions], ["Revenue", `$${((Number(h.revenue) || 0) / 100).toFixed(2)}`],
          ["Active subs", h.subscriptions], ["Credits spent", h.creditsSpent],
        ].map(([l, v]) => (
          <div key={l as string} className="qx-card p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{String(l)}</p>
            <p className="font-display text-lg font-extrabold mt-0.5" style={{ color: "var(--text)" }}>{String(v ?? 0)}</p>
          </div>
        ))}
        <div className="qx-card p-3.5" style={{ borderColor: "color-mix(in srgb, #4ade80 40%, var(--border))" }}>
          <p className="text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1" style={{ color: "#4ade80" }}><FiActivity size={10} /> Realtime 5m</p>
          <p className="font-display text-lg font-extrabold mt-0.5" style={{ color: "var(--text)" }}>{String(h.realtime ?? 0)}</p>
        </div>
      </div>

      {/* Time series */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {([["Traffic", s.traffic, COLORS[0]], ["Tool usage", s.toolUse, COLORS[1]], ["Signups", s.signups, COLORS[2]], ["Revenue (¢)", s.revenueDaily, COLORS[4]]] as [string, Pt[], string][]).map(([l, d, c]) => (
          <div key={l} className="qx-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{l}</p>
            <Area data={d || []} color={c} />
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Countries</p>
          <Bars data={b.countries || []} color={COLORS[2]} />
        </div>
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Devices</p>
          <Donut data={b.devices || []} />
          <p className="text-[10px] font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: "var(--text-faint)" }}>Browsers</p>
          <Bars data={b.browsers || []} color={COLORS[5]} />
        </div>
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Referrers</p>
          <Bars data={b.referrers || []} color={COLORS[6]} />
          <p className="text-[10px] font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: "var(--text-faint)" }}>Categories</p>
          <Donut data={b.categories || []} />
        </div>
      </div>

      {/* Funnel · retention · heatmap · tops */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Conversion funnel</p>
          <Funnel steps={(data?.funnel as { stage: string; value: number }[]) || []} />
        </div>
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Retention (active again after day)</p>
          {((data?.retention as { day: string; size: number; retained: number }[]) || []).map((c) => (
            <div key={c.day} className="flex items-center gap-2 text-[12px] py-1">
              <span className="w-20" style={{ color: "var(--text-muted)" }}>{c.day.slice(5)}</span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full" style={{ width: `${c.retained}%`, background: COLORS[4] }} />
              </div>
              <span className="w-16 text-right" style={{ color: "var(--text)" }}>{c.retained}% <span style={{ color: "var(--text-faint)" }}>of {c.size}</span></span>
            </div>
          ))}
        </div>
      </div>
      <div className="qx-card p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Activity heatmap (UTC, weekday × hour)</p>
        <Heatmap grid={(data?.heatmap as number[][]) || Array.from({ length: 7 }, () => Array(24).fill(0))} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Top tools</p>
          <Bars data={((data?.topTools as { tool: string; count: number }[]) || []).map((t) => ({ name: t.tool, value: t.count }))} color={COLORS[0]} />
        </div>
        <div className="qx-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Most active users</p>
          <Bars data={((data?.activeUsers as { email: string; count: number }[]) || []).map((u) => ({ name: u.email, value: u.count }))} color={COLORS[3]} />
        </div>
      </div>
    </div>
  );
}

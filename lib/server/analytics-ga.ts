/* Real visitor numbers, read from GA4 — SERVER ONLY.
   ───────────────────────────────────────────────────────────────────────────
   The Telegram daily report used lib/server/analytics, which is backed by the
   in-memory mock db. On Vercel that store is empty after every cold start, so
   the owner was being sent a tidy message full of zeros and reading it as the
   state of the site. A report that is confidently wrong is worse than none,
   because it gets believed.

   This reads the same GA4 property `npm run ga` reads, with the same
   no-dependency JWT: node:crypto signs it, one fetch exchanges it.

   GATED ON CREDENTIALS. It needs GSC_SERVICE_ACCOUNT_JSON — the service
   account's private key, which must never be committed. When the variable is
   absent every function here returns null and the report says so in plain
   words rather than printing zeros. That is the difference between "nobody
   came" and "we cannot see", and confusing those two is what this file exists
   to stop. */
import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
const DATA = "https://analyticsdata.googleapis.com/v1beta";

export function gaConfigured(): boolean {
  return !!process.env.GSC_SERVICE_ACCOUNT_JSON;
}

type Key = { client_email: string; private_key: string };
function loadKey(): Key | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const k = JSON.parse(raw);
    return k?.client_email && k?.private_key ? k : null;
  } catch { return null; }
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

/* One token per lambda instance rather than per call — the report fires
   several queries and each JWT exchange is a full round trip. */
let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string | null> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const key = loadKey();
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const sig = crypto.createSign("RSA-SHA256").update(`${header}.${claim}`).sign(key.private_key);
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  }).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json().catch(() => null) as { access_token?: string } | null;
  if (!j?.access_token) return null;
  cached = { token: j.access_token, exp: Date.now() + 3_500_000 };
  return j.access_token;
}

let propertyCache: string | null = null;
async function propertyId(token: string): Promise<string | null> {
  if (propertyCache) return propertyCache;
  if (process.env.GA_PROPERTY_ID) return (propertyCache = `properties/${process.env.GA_PROPERTY_ID}`);
  const r = await fetch(`${ADMIN}/accountSummaries`, { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json().catch(() => null) as any;
  const props = (j?.accountSummaries || []).flatMap((a: any) => a.propertySummaries || []);
  const pick = props.find((p: any) => /qrix/i.test(p.displayName)) || props[0];
  return pick ? (propertyCache = pick.property) : null;
}

export type GaRow = { name: string; value: number; users?: number };
export type GaSnapshot = {
  from: string; to: string;
  users: number; sessions: number; views: number;
  prevUsers: number;
  tools: GaRow[];      // what people actually finished doing
  unnamedTools: number; // tool_used events with no `tool` dimension yet
  sources: GaRow[];
  pages: GaRow[];
  countries: GaRow[];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const ago = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return iso(d); };

/** null means "we could not look", never "nothing happened". */
export async function gaSnapshot(days = 1): Promise<GaSnapshot | null> {
  const token = await accessToken();
  if (!token) return null;
  const property = await propertyId(token);
  if (!property) return null;

  const cur = { startDate: ago(days), endDate: ago(1) };
  const prev = { startDate: ago(days * 2), endDate: ago(days + 1) };
  const run = async (body: unknown) => {
    const r = await fetch(`${DATA}/${property}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!r?.ok) return null;
    return await r.json().catch(() => null) as any;
  };

  const totals = await run({ dateRanges: [cur, prev], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }] });
  if (!totals) return null;
  const at = (i: number) => {
    const row = (totals.rows || []).find((r: any) => r.dimensionValues?.[0]?.value === `date_range_${i}`) || (totals.rows || [])[i];
    const v = (row?.metricValues || []).map((m: any) => Number(m.value));
    return { users: v[0] || 0, sessions: v[1] || 0, views: v[2] || 0 };
  };

  const dim = async (name: string, limit = 5): Promise<GaRow[]> => {
    const r = await run({ dateRanges: [cur], dimensions: [{ name }], metrics: [{ name: "activeUsers" }], limit, orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }] });
    return (r?.rows || []).map((x: any) => ({ name: x.dimensionValues[0].value, value: Number(x.metricValues[0].value) }));
  };

  /* tool_used only fires on SUCCESS, so this is "what people finished", not
     "what they clicked". That is the whole point of reporting it. */
  const toolsRaw = await run({
    dateRanges: [cur], dimensions: [{ name: "customEvent:tool" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }], limit: 8,
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "tool_used" } } },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  });
  const allTools: GaRow[] = (toolsRaw?.rows || []).map((x: any) => ({
    name: x.dimensionValues[0].value,
    value: Number(x.metricValues[0].value),
    users: Number(x.metricValues[1].value),
  }));

  const [sources, pages, countries] = await Promise.all([dim("sessionSourceMedium"), dim("pagePath"), dim("country")]);
  const now = at(0);

  return {
    from: cur.startDate, to: cur.endDate,
    users: now.users, sessions: now.sessions, views: now.views,
    prevUsers: at(1).users,
    tools: allTools.filter((t) => t.name !== "(not set)"),
    unnamedTools: allTools.find((t) => t.name === "(not set)")?.value ?? 0,
    sources, pages, countries,
  };
}

/* Uzbek names for the countries this site actually sees. Anything else keeps
   GA's own label rather than being silently mistranslated. */
const UZ_COUNTRY: Record<string, string> = {
  Russia: "Россия", Uzbekistan: "Ўзбекистон", Kazakhstan: "Қозоғистон", Ukraine: "Украина",
  "United States": "АҚШ", Belarus: "Беларусь", "Türkiye": "Туркия", Turkey: "Туркия",
  Kyrgyzstan: "Қирғизистон", Tajikistan: "Тожикистон", Azerbaijan: "Озарбайжон",
  Germany: "Германия", India: "Ҳиндистон", China: "Хитой", Netherlands: "Нидерландия",
  Poland: "Польша", France: "Франция", "United Kingdom": "Буюк Британия",
};

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pct = (a: number, b: number) => (b ? `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : a ? "янги" : "0%");
const list = (rows: GaRow[], label: (r: GaRow) => string) =>
  rows.length ? rows.map((r) => `   • ${label(r)}`).join("\n") : "   • маълумот йўқ";

/** The Uzbek block appended to the Telegram report. */
export async function uzbekTrafficBlock(days = 1): Promise<string> {
  const g = await gaSnapshot(days);
  if (!g) {
    return gaConfigured()
      ? "\n\n📊 <b>Ташрифлар</b>\n   ⚠️ GA'дан ўқиб бўлмади — калит бор, лекин жавоб келмади."
      : "\n\n📊 <b>Ташрифлар</b>\n   ⚠️ Аналитика уланмаган (GSC_SERVICE_ACCOUNT_JSON йўқ), шунинг учун ташриф рақамлари кўрсатилмади.\n   <i>Ноль деб ёзилмади — «ҳеч ким келмади» билан «кўра олмаяпмиз» бошқа-бошқа нарса.</i>";
  }

  const window = days === 1 ? "Кеча" : `Охирги ${days} кун`;
  return [
    ``, ``,
    `📊 <b>${window} — ${g.from}</b>`,
    `👥 Ташриф: <b>${g.users}</b> киши (${pct(g.users, g.prevUsers)})  ·  сессия ${g.sessions}  ·  кўриш ${g.views}`,
    ``,
    `🧰 <b>Нима ишлатишди</b>`,
    g.tools.length
      ? g.tools.map((t) => `   • ${esc(t.name)} — <b>${t.value}</b> марта, ${t.users} киши`).join("\n")
      : "   • ҳеч ким асбобни охиригача ишлатмади",
    g.unnamedTools ? `   <i>(яна ${g.unnamedTools} ҳодиса номсиз — 24 августдан олдин ёзилган)</i>` : "",
    ``,
    `🌐 <b>Қаердан келишди</b>`,
    list(g.sources, (r) => `${esc(r.name)} — ${r.value}`),
    ``,
    `📄 <b>Нима очишди</b>`,
    list(g.pages, (r) => `${esc(r.name)} — ${r.value}`),
    ``,
    `🗺 <b>Мамлакатлар</b>`,
    list(g.countries, (r) => `${esc(UZ_COUNTRY[r.name] || r.name)} — ${r.value}`),
    ``,
    `<i>Cookie'ни қабул қилмаган одам GA'да тўлиқ саналмайди — бу рақамлар қуйи чегара, аниқ сон эмас.</i>`,
  ].filter((l) => l !== "").join("\n");
}

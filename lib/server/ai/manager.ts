/**
 * AI Provider Manager — the ONLY entry point tools may use for AI work.
 *
 *   runAiTask("summarize", { prompt }) →
 *     smart route → healthy, enabled, keyed providers in priority order →
 *     cache hit? return → call → rate-limit/error? fall back to next →
 *     record latency/usage/cost → uniform result (provider errors never leak).
 *
 * Runtime settings (enable/disable, primary/backup, encrypted keys) live in
 * the db `aiProviders` collection and are managed from /admin. SERVER ONLY.
 */
import { PROVIDERS, DEFAULT_PRIORITY, TASK_ROUTES, RateLimitError, type AiTaskKind, type AiInput, type AiOutput, type ProviderId } from "./providers";
import { db, helpers } from "../db";
import { cache } from "../cache";
import { encryptSecret, decryptSecret, sha256 } from "../security";

export interface ProviderSettings {
  id: ProviderId;
  enabled: boolean;
  primary: boolean;
  backup: boolean;
  /** AES-GCM encrypted; never returned to clients */
  encryptedKey?: string | null;
}

export interface ProviderHealth {
  requests: number;
  failures: number;
  rateLimited: number;
  totalLatencyMs: number;
  tokens: number;
  costUsd: number;
  lastRequestAt?: string;
  lastError?: string;
  lastLatencyMs?: number;
  dayKey: string;
  dailyRequests: number;
}

export interface AiResult extends AiOutput {
  provider: ProviderId;
  cached: boolean;
  latencyMs: number;
}

const health = new Map<ProviderId, ProviderHealth>();
const blank = (): ProviderHealth => ({ requests: 0, failures: 0, rateLimited: 0, totalLatencyMs: 0, tokens: 0, costUsd: 0, dayKey: today(), dailyRequests: 0 });
const today = () => new Date().toISOString().slice(0, 10);
const stat = (id: ProviderId) => {
  let h = health.get(id);
  if (!h) { h = blank(); health.set(id, h); }
  if (h.dayKey !== today()) { h.dayKey = today(); h.dailyRequests = 0; }
  return h;
};

/** Providers a failed call skips for a cool-down window (rate limits). */
const cooldown = new Map<ProviderId, number>();

// ── Settings (db-backed runtime overrides) ─────────────────────────────
function getSettings(id: ProviderId): ProviderSettings {
  return db.aiProviders.find((p) => p.id === id) || { id, enabled: true, primary: false, backup: false, encryptedKey: null };
}

export async function updateProviderSettings(id: ProviderId, patch: { enabled?: boolean; primary?: boolean; backup?: boolean; apiKey?: string | null }): Promise<ProviderSettings> {
  const current = getSettings(id);
  const next: ProviderSettings = {
    ...current,
    enabled: patch.enabled ?? current.enabled,
    primary: patch.primary ?? current.primary,
    backup: patch.backup ?? current.backup,
  };
  if (patch.apiKey !== undefined) next.encryptedKey = patch.apiKey ? await encryptSecret(patch.apiKey) : null;
  // Only one primary / one backup across the fleet.
  if (patch.primary) db.aiProviders.all().forEach((p) => p.id !== id && p.primary && db.aiProviders.update((x) => x.id === p.id, { primary: false }));
  if (patch.backup) db.aiProviders.all().forEach((p) => p.id !== id && p.backup && db.aiProviders.update((x) => x.id === p.id, { backup: false }));
  if (db.aiProviders.find((p) => p.id === id)) db.aiProviders.update((p) => p.id === id, next);
  else db.aiProviders.insert(next);
  return next;
}

/** Resolve the usable API key: admin-stored (encrypted) first, then env. */
async function resolveKey(id: ProviderId): Promise<string | null> {
  const s = getSettings(id);
  if (s.encryptedKey) {
    const k = await decryptSecret(s.encryptedKey);
    if (k) return k;
  }
  return process.env[PROVIDERS[id].envKey]?.trim() || null;
}

async function isReady(id: ProviderId): Promise<boolean> {
  if (!getSettings(id).enabled) return false;
  if ((cooldown.get(id) || 0) > Date.now()) return false;
  return !!(await resolveKey(id));
}

// ── Candidate ordering: primary → backup → smart route → default ───────
async function candidates(task: AiTaskKind): Promise<ProviderId[]> {
  const capable = (id: ProviderId) => PROVIDERS[id].capabilities.includes(task);
  const ordered: ProviderId[] = [];
  const push = (id: ProviderId) => { if (capable(id) && !ordered.includes(id)) ordered.push(id); };

  const all = db.aiProviders.all();
  const primary = all.find((p) => p.primary)?.id;
  const backup = all.find((p) => p.backup)?.id;
  if (primary) push(primary);
  if (backup) push(backup);
  (TASK_ROUTES[task] || DEFAULT_PRIORITY).forEach(push);
  DEFAULT_PRIORITY.forEach(push);

  const ready: ProviderId[] = [];
  for (const id of ordered) if (await isReady(id)) ready.push(id);
  return ready;
}

// ── Main entry point ────────────────────────────────────────────────────
export async function runAiTask(task: AiTaskKind, input: AiInput, opts: { cacheTtl?: number; userId?: string | null } = {}): Promise<AiResult> {
  // Response cache — identical task+input within TTL returns instantly.
  const cacheable = (opts.cacheTtl ?? defaultTtl(task)) > 0 && !input.image;
  const key = cacheable ? `ai:${task}:${await sha256(JSON.stringify(input))}` : "";
  if (cacheable) {
    const hit = await cache.get<AiResult>(key);
    if (hit) return { ...hit, cached: true };
  }

  const list = await candidates(task);
  let lastErr = "no_provider_available";

  for (const id of list) {
    const def = PROVIDERS[id];
    const h = stat(id);
    const t0 = Date.now();
    try {
      const apiKey = (await resolveKey(id))!;
      const out = await def.call(task, input, apiKey);
      const latencyMs = Date.now() - t0;
      h.requests++; h.dailyRequests++; h.totalLatencyMs += latencyMs; h.lastLatencyMs = latencyMs;
      h.lastRequestAt = helpers.now(); h.lastError = undefined;
      if (out.tokens) { h.tokens += out.tokens; h.costUsd += (out.tokens / 1_000_000) * def.costPerUnit; }
      else if (task === "image-generate") h.costUsd += def.costPerUnit;

      const result: AiResult = { ...out, provider: id, cached: false, latencyMs };
      if (cacheable && (out.text || out.imageUrl)) await cache.set(key, result, opts.cacheTtl ?? defaultTtl(task));
      return result;
    } catch (e) {
      const latencyMs = Date.now() - t0;
      h.requests++; h.dailyRequests++; h.failures++; h.totalLatencyMs += latencyMs;
      h.lastRequestAt = helpers.now();
      h.lastError = e instanceof Error ? e.message.slice(0, 200) : "unknown";
      if (e instanceof RateLimitError) {
        h.rateLimited++;
        cooldown.set(id, Date.now() + 60_000); // back off a minute, try the next provider
      }
      lastErr = h.lastError;
      // fall through to the next candidate — provider errors never reach users
    }
  }
  throw new Error(`ai_unavailable (${lastErr})`);
}

function defaultTtl(task: AiTaskKind): number {
  switch (task) {
    case "translate": case "summarize": case "text": case "code": return 600;
    case "image-analyze": case "ocr": return 0;
    case "image-generate": return 0;
    default: return 0;
  }
}

/** True when at least one enabled + keyed provider can actually serve this task.
    Lets a caller refuse the work up front instead of charging for a job that is
    guaranteed to fail (e.g. 3D with no FAL/REPLICATE key configured). */
export async function hasProviderFor(task: AiTaskKind): Promise<boolean> {
  return (await candidates(task)).length > 0;
}

// ── Admin status/analytics view ─────────────────────────────────────────
export async function providerStatus() {
  const out = [];
  for (const id of DEFAULT_PRIORITY) {
    const def = PROVIDERS[id];
    const s = getSettings(id);
    const h = stat(id);
    const keySource = s.encryptedKey ? "admin" : process.env[def.envKey]?.trim() ? "env" : null;
    out.push({
      id, name: def.name, free: def.free, capabilities: def.capabilities,
      enabled: s.enabled, primary: s.primary, backup: s.backup,
      hasKey: !!keySource, keySource,
      // legacy fields kept for the System tab
      ready: !!keySource && s.enabled, active: s.primary,
      coolingDown: (cooldown.get(id) || 0) > Date.now(),
      requests: h.requests, dailyRequests: h.dailyRequests, failures: h.failures, rateLimited: h.rateLimited,
      successRate: h.requests ? Math.round(((h.requests - h.failures) / h.requests) * 100) : null,
      avgLatencyMs: h.requests ? Math.round(h.totalLatencyMs / h.requests) : null,
      lastLatencyMs: h.lastLatencyMs ?? null,
      lastRequestAt: h.lastRequestAt ?? null,
      lastError: h.lastError ?? null,
      tokens: h.tokens, costUsd: Math.round(h.costUsd * 10000) / 10000,
    });
  }
  return out;
}

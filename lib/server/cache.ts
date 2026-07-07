/**
 * Cache layer — one async surface, three production drivers, zero deps:
 *
 *   memory   — TTL map (default; single node / dev)
 *   upstash  — Upstash Redis REST (serverless/Vercel; UPSTASH_REDIS_REST_URL
 *              + UPSTASH_REDIS_REST_TOKEN, or an https:// REDIS_URL)
 *   redis    — classic Redis over raw RESP TCP (redis://[:pass@]host:port),
 *              minimal client with automatic reconnect (Docker/VM deploys)
 *
 * Backs sessions, response cache, rate limiting and queue coordination.
 * SERVER ONLY.
 */
import { serverConfig } from "./config";

interface CacheDriver {
  name: string;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlSeconds: number): Promise<number>;
  ping(): Promise<boolean>;
}

// ── memory ──────────────────────────────────────────────────────────────
class MemoryDriver implements CacheDriver {
  name = "memory";
  private store = new Map<string, { v: string; exp: number }>();
  async get(key: string) {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) { this.store.delete(key); return null; }
    return e.v;
  }
  async set(key: string, value: string, ttl: number) {
    this.store.set(key, { v: value, exp: ttl ? Date.now() + ttl * 1000 : 0 });
  }
  async del(key: string) { this.store.delete(key); }
  async incr(key: string, ttl: number) {
    const next = (Number(await this.get(key)) || 0) + 1;
    await this.set(key, String(next), ttl);
    return next;
  }
  async ping() { return true; }
}

// ── upstash REST ────────────────────────────────────────────────────────
class UpstashDriver implements CacheDriver {
  name = "upstash";
  constructor(private url: string, private token: string) {}
  private async cmd<T = unknown>(...args: (string | number)[]): Promise<T | null> {
    try {
      const r = await fetch(this.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const j = (await r.json()) as { result?: T };
      return j.result ?? null;
    } catch { return null; }
  }
  async get(key: string) { return (await this.cmd<string>("GET", key)) ?? null; }
  async set(key: string, value: string, ttl: number) {
    if (ttl) await this.cmd("SET", key, value, "EX", ttl); else await this.cmd("SET", key, value);
  }
  async del(key: string) { await this.cmd("DEL", key); }
  async incr(key: string, ttl: number) {
    const n = (await this.cmd<number>("INCR", key)) ?? 1;
    if (n === 1 && ttl) await this.cmd("EXPIRE", key, ttl);
    return n;
  }
  async ping() { return (await this.cmd<string>("PING")) === "PONG"; }
}

// ── raw RESP TCP (minimal, reconnecting) ────────────────────────────────
class RespDriver implements CacheDriver {
  name = "redis";
  private queue: Promise<unknown> = Promise.resolve();
  private sock: import("net").Socket | null = null;
  constructor(private host: string, private port: number, private pass?: string) {}

  private async socket(): Promise<import("net").Socket> {
    if (this.sock && !this.sock.destroyed) return this.sock;
    const net = await import("net");
    const sock = net.createConnection({ host: this.host, port: this.port });
    sock.setKeepAlive(true);
    sock.on("error", () => { sock.destroy(); if (this.sock === sock) this.sock = null; });
    sock.on("close", () => { if (this.sock === sock) this.sock = null; }); // auto-reconnect on next cmd
    await new Promise<void>((res, rej) => { sock.once("connect", () => res()); sock.once("error", rej); });
    this.sock = sock;
    if (this.pass) await this.exec(sock, ["AUTH", this.pass]);
    return sock;
  }

  private exec(sock: import("net").Socket, args: string[]): Promise<string | number | null> {
    const payload = `*${args.length}\r\n${args.map((a) => `$${Buffer.byteLength(a)}\r\n${a}\r\n`).join("")}`;
    return new Promise((resolve, reject) => {
      let buf = "";
      const onData = (d: Buffer) => {
        buf += d.toString();
        // Parse one complete reply (simple/bulk/int/error).
        if (buf.startsWith("+")) { done(buf.slice(1, buf.indexOf("\r\n"))); }
        else if (buf.startsWith(":")) { done(Number(buf.slice(1, buf.indexOf("\r\n")))); }
        else if (buf.startsWith("-")) { fail(new Error(buf.slice(1, buf.indexOf("\r\n")))); }
        else if (buf.startsWith("$")) {
          const nl = buf.indexOf("\r\n");
          const len = Number(buf.slice(1, nl));
          if (len === -1) return done(null);
          if (buf.length >= nl + 2 + len + 2) done(buf.slice(nl + 2, nl + 2 + len));
        }
      };
      const done = (v: string | number | null) => { cleanup(); resolve(v); };
      const fail = (e: Error) => { cleanup(); reject(e); };
      const cleanup = () => { sock.off("data", onData); sock.off("error", fail); };
      sock.on("data", onData);
      sock.once("error", fail);
      sock.write(payload);
    });
  }

  /** Serialize commands — the parser handles one in-flight reply at a time. */
  private run(args: string[]): Promise<string | number | null> {
    const next = this.queue.then(async () => this.exec(await this.socket(), args));
    this.queue = next.catch(() => {});
    return next;
  }

  async get(key: string) { try { return (await this.run(["GET", key])) as string | null; } catch { return null; } }
  async set(key: string, value: string, ttl: number) {
    try { await this.run(ttl ? ["SET", key, value, "EX", String(ttl)] : ["SET", key, value]); } catch { /* degraded */ }
  }
  async del(key: string) { try { await this.run(["DEL", key]); } catch { /* degraded */ } }
  async incr(key: string, ttl: number) {
    try {
      const n = Number(await this.run(["INCR", key]));
      if (n === 1 && ttl) await this.run(["EXPIRE", key, String(ttl)]);
      return n;
    } catch { return 1; }
  }
  async ping() { try { return (await this.run(["PING"])) === "PONG"; } catch { return false; } }
}

function makeDriver(): CacheDriver {
  const upUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upUrl && upToken) return new UpstashDriver(upUrl, upToken);

  const url = serverConfig.cache.url;
  if (url?.startsWith("https://") && upToken) return new UpstashDriver(url, upToken);
  if (url?.startsWith("redis://") || url?.startsWith("rediss://")) {
    try {
      const u = new URL(url);
      return new RespDriver(u.hostname, Number(u.port || 6379), u.password || undefined);
    } catch { /* fall through */ }
  }
  return new MemoryDriver();
}

const driver = makeDriver();

/** Public cache API — JSON-typed helpers over the active driver. */
export const cache = {
  driver: driver.name,

  async get<T>(key: string): Promise<T | null> {
    const raw = await driver.get(key);
    if (raw === null) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  },

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    await driver.set(key, JSON.stringify(value), ttlSeconds);
  },

  async del(key: string): Promise<void> { await driver.del(key); },

  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T> | T): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  async incr(key: string, ttlSeconds: number): Promise<number> {
    return driver.incr(key, ttlSeconds);
  },

  /** Health probe for monitoring/readiness. */
  async healthy(): Promise<boolean> { return driver.ping(); },
};

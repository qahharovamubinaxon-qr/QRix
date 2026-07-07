/** Cache abstraction. In-memory TTL map by default; swap to Redis by setting
    REDIS_URL (same async surface). SERVER ONLY. */
import { serverConfig } from "./config";

type Entry = { v: unknown; exp: number };
const store = new Map<string, Entry>();

export const cache = {
  driver: serverConfig.cache.driver,

  async get<T>(key: string): Promise<T | null> {
    const e = store.get(key);
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) { store.delete(key); return null; }
    return e.v as T;
  },

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    store.set(key, { v: value, exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
  },

  async del(key: string): Promise<void> { store.delete(key); },

  /** Return cached value or compute, store and return it. */
  async remember<T>(key: string, ttlSeconds: number, fn: () => Promise<T> | T): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  /** Fixed-window counter used by the rate limiter. */
  async incr(key: string, ttlSeconds: number): Promise<number> {
    const cur = (await this.get<number>(key)) ?? 0;
    const next = cur + 1;
    await this.set(key, next, ttlSeconds);
    return next;
  },
};

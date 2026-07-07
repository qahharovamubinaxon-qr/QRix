/**
 * Object storage — one interface, production drivers, zero deps:
 *
 *   local — .qrix-storage on disk (dev / single-node fallback)
 *   s3    — ANY S3-compatible provider via AWS Signature V4 implemented on
 *           Web Crypto: Amazon S3, Cloudflare R2, Backblaze B2, MinIO.
 *           STORAGE_DRIVER=s3 + S3_ENDPOINT/S3_REGION/S3_ACCESS_KEY_ID/
 *           S3_SECRET_ACCESS_KEY/STORAGE_BUCKET.
 *   supabase — Supabase Storage bucket (service-role key)
 *
 * Presigned GET URLs, temp uploads with TTL + automatic cleanup, and
 * per-user/platform storage analytics. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { db, uid, helpers } from "./db";
import type { Upload } from "./models";

export interface StoredObject { key: string; url: string; size: number; mime: string }

export interface StorageDriver {
  name: string;
  put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  url(key: string): string;
  /** Time-limited direct download URL (falls back to url()). */
  signedUrl(key: string, expiresSeconds?: number): Promise<string>;
  ping(): Promise<boolean>;
}

// ── local ───────────────────────────────────────────────────────────────
class LocalDriver implements StorageDriver {
  name = "local";
  private dir = ".qrix-storage";
  private async fs() { return import("fs/promises"); }
  private path(key: string) { return `${this.dir}/${key.replace(/[^a-z0-9._/-]/gi, "_")}`; }
  async put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject> {
    const fs = await this.fs();
    const p = this.path(key);
    await fs.mkdir(p.split("/").slice(0, -1).join("/"), { recursive: true });
    await fs.writeFile(p, data);
    return { key, url: this.url(key), size: data.byteLength, mime };
  }
  async get(key: string): Promise<Buffer | null> {
    try { return await (await this.fs()).readFile(this.path(key)); } catch { return null; }
  }
  async delete(key: string): Promise<void> {
    try { await (await this.fs()).unlink(this.path(key)); } catch { /* gone */ }
  }
  url(key: string) { return `/api/storage/${key.split("/").map(encodeURIComponent).join("/")}`; }
  async signedUrl(key: string) { return this.url(key); }
  async ping() { return true; }
}

// ── S3-compatible (SigV4 over Web Crypto) ───────────────────────────────
const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha256hex = async (data: string | Uint8Array) =>
  hex(await crypto.subtle.digest("SHA-256", typeof data === "string" ? enc.encode(data) : (data as Uint8Array<ArrayBuffer>)));
async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(msg));
}

class S3Driver implements StorageDriver {
  name = "s3";
  private endpoint: string;
  private region: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  constructor() {
    const c = serverConfig.storage;
    this.endpoint = (c.endpoint || `https://s3.${c.region || "us-east-1"}.amazonaws.com`).replace(/\/$/, "");
    this.region = c.region || "us-east-1";
    this.bucket = c.bucket;
    this.accessKey = c.accessKey || "";
    this.secretKey = c.secretKey || "";
  }

  private encodeKey(key: string) { return key.split("/").map(encodeURIComponent).join("/"); }

  private async signingKey(date: string): Promise<ArrayBuffer> {
    let k: ArrayBuffer = await hmac(enc.encode(`AWS4${this.secretKey}`), date);
    for (const part of [this.region, "s3", "aws4_request"]) k = await hmac(k, part);
    return k;
  }

  /** Signed fetch for header-auth requests (PUT/GET/DELETE). */
  private async request(method: string, key: string, body?: Uint8Array, mime?: string): Promise<Response> {
    const host = new URL(this.endpoint).host;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const date = amzDate.slice(0, 8);
    const path = `/${this.bucket}/${this.encodeKey(key)}`;
    const payloadHash = await sha256hex(body ?? "");
    const headers: Record<string, string> = {
      host, "x-amz-date": amzDate, "x-amz-content-sha256": payloadHash,
      ...(mime ? { "content-type": mime } : {}),
    };
    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonical = [
      method, path, "",
      ...Object.keys(headers).sort().map((h) => `${h}:${headers[h]}`), "",
      signedHeaders, payloadHash,
    ].join("\n");
    const scope = `${date}/${this.region}/s3/aws4_request`;
    const toSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${await sha256hex(canonical)}`;
    const signature = hex(await hmac(await this.signingKey(date), toSign));
    return fetch(`${this.endpoint}${path}`, {
      method,
      headers: {
        ...headers,
        Authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      },
      body: body as BodyInit | undefined,
    });
  }

  async put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject> {
    const r = await this.request("PUT", key, new Uint8Array(data), mime);
    if (!r.ok) throw new Error(`s3_put_failed_${r.status}`);
    return { key, url: this.url(key), size: data.byteLength, mime };
  }
  async get(key: string): Promise<Buffer | null> {
    const r = await this.request("GET", key);
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  }
  async delete(key: string): Promise<void> {
    await this.request("DELETE", key).catch(() => {});
  }
  url(key: string) { return `${this.endpoint}/${this.bucket}/${this.encodeKey(key)}`; }

  /** Presigned GET (query-auth SigV4). */
  async signedUrl(key: string, expiresSeconds = 3600): Promise<string> {
    const host = new URL(this.endpoint).host;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const date = amzDate.slice(0, 8);
    const scope = `${date}/${this.region}/s3/aws4_request`;
    const path = `/${this.bucket}/${this.encodeKey(key)}`;
    const params = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${this.accessKey}/${scope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expiresSeconds),
      "X-Amz-SignedHeaders": "host",
    });
    const canonicalQuery = [...params.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
    const canonical = ["GET", path, canonicalQuery, `host:${host}`, "", "host", "UNSIGNED-PAYLOAD"].join("\n");
    const toSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${await sha256hex(canonical)}`;
    const signature = hex(await hmac(await this.signingKey(date), toSign));
    return `${this.endpoint}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
  }
  async ping() {
    try { const r = await this.request("GET", `__health-${Date.now()}`); return r.status === 404 || r.ok; } catch { return false; }
  }
}

// ── Supabase Storage ────────────────────────────────────────────────────
class SupabaseDriver implements StorageDriver {
  name = "supabase";
  private base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`;
  private key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  private headers(extra: Record<string, string> = {}) {
    return { Authorization: `Bearer ${this.key}`, apikey: this.key, ...extra };
  }
  async put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject> {
    const r = await fetch(`${this.base}/object/${serverConfig.storage.bucket}/${key}`, {
      method: "POST", headers: this.headers({ "Content-Type": mime, "x-upsert": "true" }), body: new Uint8Array(data),
    });
    if (!r.ok) throw new Error(`supabase_put_failed_${r.status}`);
    return { key, url: this.url(key), size: data.byteLength, mime };
  }
  async get(key: string): Promise<Buffer | null> {
    const r = await fetch(`${this.base}/object/${serverConfig.storage.bucket}/${key}`, { headers: this.headers() });
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
  }
  async delete(key: string): Promise<void> {
    await fetch(`${this.base}/object/${serverConfig.storage.bucket}/${key}`, { method: "DELETE", headers: this.headers() }).catch(() => {});
  }
  url(key: string) { return `${this.base}/object/public/${serverConfig.storage.bucket}/${key}`; }
  async signedUrl(key: string, expiresSeconds = 3600): Promise<string> {
    const r = await fetch(`${this.base}/object/sign/${serverConfig.storage.bucket}/${key}`, {
      method: "POST", headers: this.headers({ "Content-Type": "application/json" }), body: JSON.stringify({ expiresIn: expiresSeconds }),
    });
    const j = (await r.json().catch(() => ({}))) as { signedURL?: string };
    return j.signedURL ? `${this.base}${j.signedURL}` : this.url(key);
  }
  async ping() {
    try { return (await fetch(`${this.base}/bucket`, { headers: this.headers() })).ok; } catch { return false; }
  }
}

function makeDriver(): StorageDriver {
  switch (serverConfig.storage.driver) {
    case "s3": return new S3Driver();
    case "supabase": return new SupabaseDriver();
    default: return new LocalDriver();
  }
}
export const storageDriver = makeDriver();

// ── Upload manager (metadata + TTL) ─────────────────────────────────────
export async function upload(userId: string, name: string, mime: string, data: Buffer | Uint8Array, opts?: { temporary?: boolean }): Promise<Upload> {
  const temporary = opts?.temporary ?? true;
  const key = `${userId}/${uid("up")}-${name.replace(/[^a-z0-9._-]/gi, "_")}`;
  const stored = await storageDriver.put(key, data, mime);
  const rec: Upload = {
    id: uid("upl"), userId, key, name, mime, size: stored.size, temporary,
    expiresAt: temporary ? helpers.daysAhead(serverConfig.storage.tempTtlMinutes / 1440) : null,
    createdAt: helpers.now(),
  };
  db.uploads.insert(rec);
  return rec;
}

export async function removeUpload(id: string): Promise<void> {
  const rec = db.uploads.find((u) => u.id === id);
  if (rec) { await storageDriver.delete(rec.key); db.uploads.remove((u) => u.id === id); }
}

/** Purge expired temporary uploads (cron / admin action). */
export async function cleanupExpired(): Promise<number> {
  const now = helpers.now();
  const expired = db.uploads.filter((u) => u.temporary && u.expiresAt != null && u.expiresAt < now);
  await Promise.all(expired.map((u) => storageDriver.delete(u.key)));
  db.uploads.remove((u) => u.temporary && u.expiresAt != null && u.expiresAt < now);
  return expired.length;
}

export function storageUsage(userId: string): { count: number; bytes: number } {
  const rows = db.uploads.filter((u) => u.userId === userId);
  return { count: rows.length, bytes: rows.reduce((s, u) => s + u.size, 0) };
}

/** Platform-wide storage analytics for the admin panel. */
export function storageAnalytics() {
  const all = db.uploads.all();
  return {
    driver: storageDriver.name,
    objects: all.length,
    bytes: all.reduce((s, u) => s + u.size, 0),
    temporary: all.filter((u) => u.temporary).length,
    expiringSoon: all.filter((u) => u.expiresAt != null && u.expiresAt < helpers.daysAhead(1)).length,
  };
}

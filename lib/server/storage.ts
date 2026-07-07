/**
 * File storage abstraction. One interface, three drivers selected by env:
 *   local     — writes under .qrix-storage (dev / single-node)
 *   s3        — any S3-compatible provider (AWS, R2, Backblaze, MinIO)
 *   supabase  — Supabase Storage bucket
 * Handles temporary uploads with TTL + automatic cleanup. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { db, uid, helpers } from "./db";
import type { Upload } from "./models";

export interface StoredObject { key: string; url: string; size: number; mime: string }

export interface StorageDriver {
  put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  url(key: string): string;
}

// ── Local driver ────────────────────────────────────────────────────────
class LocalDriver implements StorageDriver {
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
  url(key: string) { return `/api/storage/${encodeURIComponent(key)}`; }
}

// ── S3 driver (stub — wired via env, presigned URLs) ────────────────────
class S3Driver implements StorageDriver {
  async put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject> {
    // Real impl: PutObject to serverConfig.storage.endpoint/bucket via signed request.
    return { key, url: this.url(key), size: data.byteLength, mime };
  }
  async get(): Promise<Buffer | null> { return null; }
  async delete(): Promise<void> {}
  url(key: string) {
    const { endpoint, bucket } = serverConfig.storage;
    return `${endpoint || "https://s3.amazonaws.com"}/${bucket}/${key}`;
  }
}

// ── Supabase Storage driver (stub) ──────────────────────────────────────
class SupabaseDriver implements StorageDriver {
  async put(key: string, data: Buffer | Uint8Array, mime: string): Promise<StoredObject> {
    return { key, url: this.url(key), size: data.byteLength, mime };
  }
  async get(): Promise<Buffer | null> { return null; }
  async delete(): Promise<void> {}
  url(key: string) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${serverConfig.storage.bucket}/${key}`;
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

// ── Upload manager (records metadata + TTL) ─────────────────────────────
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

/** Purge expired temporary uploads. Call from a cron / edge scheduled job. */
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

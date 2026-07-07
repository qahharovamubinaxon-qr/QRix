/**
 * Production PostgreSQL access via Prisma. The client package is installed at
 * deploy time (`npm i prisma @prisma/client && npx prisma generate`), so this
 * module loads it dynamically — the app builds and runs on the mock store
 * without it, and flips to Postgres when DATABASE_URL exists. SERVER ONLY.
 *
 * Deploy checklist:
 *   1. set DATABASE_URL (pooled, e.g. ?pgbouncer=true&connection_limit=10)
 *   2. npx prisma migrate deploy   (or `prisma db push` for the first sync)
 *   3. npm run db:seed             (optional demo/admin seed)
 * Schema (models, enums, indexes) lives in prisma/schema.prisma.
 */
import { serverConfig } from "./config";

type PrismaLike = { $queryRawUnsafe(q: string): Promise<unknown>; $disconnect(): Promise<void> } & Record<string, unknown>;

let client: PrismaLike | null = null;
let loadFailed = false;

/** Lazy singleton. Returns null when Prisma isn't configured/installed. */
export async function getPrisma(): Promise<PrismaLike | null> {
  if (!serverConfig.db.url || loadFailed) return null;
  if (client) return client;
  try {
    // Indirect import so bundlers/tsc don't require @prisma/client at build time.
    const mod = (await (Function("return import('@prisma/client')")() as Promise<{ PrismaClient: new (opts?: unknown) => PrismaLike }>));
    client = new mod.PrismaClient({
      datasources: { db: { url: serverConfig.db.url } },
      log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    });
    return client;
  } catch {
    loadFailed = true; // package not installed — stay on the mock store
    return null;
  }
}

/** Connection health for monitoring/readiness. */
export async function dbHealthy(): Promise<boolean> {
  const p = await getPrisma();
  if (!p) return false;
  try { await p.$queryRawUnsafe("SELECT 1"); return true; } catch { return false; }
}

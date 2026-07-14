import type { NextRequest } from "next/server";

/**
 * Cron endpoint authorization — FAIL CLOSED in production.
 *
 * In production a request is authorized ONLY when CRON_SECRET is set AND the
 * caller presents `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this
 * automatically). If CRON_SECRET is unset in production, every cron route is
 * rejected — they are never publicly triggerable. Outside production the routes
 * stay open for local testing.
 */
export function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get("authorization") === `Bearer ${secret}`;
  return process.env.NODE_ENV !== "production";
}

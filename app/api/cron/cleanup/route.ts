import { NextRequest, NextResponse } from "next/server";
import { cleanupExpired } from "@/lib/server/storage";

export const runtime = "nodejs";

/** Scheduled cleanup of expired temporary uploads (Vercel Cron / external cron).
    Protect with CRON_SECRET when set. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const purged = await cleanupExpired();
  return NextResponse.json({ ok: true, purged });
}

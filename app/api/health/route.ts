import { NextResponse } from "next/server";
import { startPollingIfDev } from "@/lib/server/telegram/bot";

export const runtime = "nodejs";

/** Liveness probe — cheap, no dependencies touched.
    Also boots the dev Telegram polling loop on first touch. */
export async function GET() {
  startPollingIfDev();
  return NextResponse.json({ ok: true, uptime: Math.round(process.uptime()) });
}

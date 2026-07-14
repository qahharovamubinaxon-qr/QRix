import { NextRequest, NextResponse } from "next/server";
import { systemHealth } from "@/lib/server/monitor";
import { notifyOwner } from "@/lib/server/telegram/notify";
import { cronAuthorized } from "@/lib/server/cron-auth";

export const runtime = "nodejs";

/** Health watchdog: checks every subsystem and pings the owner on Telegram when
    something degrades. CRON_SECRET-protected. Schedule every few hours. */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const health = await systemHealth();
  const alerts: string[] = [];

  for (const [name, c] of Object.entries(health.components)) {
    if (c.state === "down") {
      const note = "note" in c ? c.note : undefined;
      alerts.push(`${name}: DOWN`);
      notifyOwner(`watchdog:${name}`, `🚨 <b>${name} is DOWN</b>${note ? `\n<i>${note}</i>` : ""}`, 1_800_000);
    }
  }
  if (!health.env.ok) {
    for (const issue of health.env.issues) {
      notifyOwner(`watchdog:env:${issue.slice(0, 24)}`, `⚙️ <b>Config issue</b>\n<i>${issue}</i>`, 21_600_000);
    }
  }

  return NextResponse.json({
    ok: health.overall !== "down",
    overall: health.overall,
    alerts,
    env: health.env,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { sendReport } from "@/lib/server/telegram/notify";

export const runtime = "nodejs";

/** Scheduled reports: GET ?period=daily|weekly|monthly (CRON_SECRET-protected).
    Point your host cron here — e.g. daily 07:00, weekly Mon, monthly on the 1st. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const period = (req.nextUrl.searchParams.get("period") || "daily") as "daily" | "weekly" | "monthly";
  if (!["daily", "weekly", "monthly"].includes(period)) return NextResponse.json({ ok: false, error: "bad_period" }, { status: 400 });
  const sent = await sendReport(period);
  return NextResponse.json({ ok: sent });
}

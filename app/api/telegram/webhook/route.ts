import { NextRequest, NextResponse } from "next/server";
import { handleUpdate } from "@/lib/server/telegram/bot";
import { tgConfig, telegramConfigured } from "@/lib/server/telegram/config";
import { audit } from "@/lib/server/analytics";
import type { TgUpdate } from "@/lib/server/telegram/api";

export const runtime = "nodejs";

/** Telegram webhook — validates the secret token header on every request.
    Always answers 200 to Telegram (retries are pointless for rejected input). */
export async function POST(req: NextRequest) {
  if (!telegramConfigured()) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  // Signature validation: Telegram echoes the secret we registered.
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== tgConfig.secretToken) {
    audit(null, "telegram.bad_secret", req.headers.get("x-forwarded-for") || "unknown");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  if (update?.update_id) await handleUpdate(update).catch(() => {});
  return NextResponse.json({ ok: true });
}

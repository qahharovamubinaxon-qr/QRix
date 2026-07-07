import { handler, ok } from "@/lib/server/api";
import { PLANS } from "@/lib/server/billing";
import { isLive } from "@/lib/server/config";

export const runtime = "nodejs";

export const GET = handler(async () => ok({ plans: PLANS, live: isLive.billing, trialDays: 14 }));

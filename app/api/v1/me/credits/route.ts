import { handler, ok } from "@/lib/server/api";
import { getAccount, creditHistory, costOf, getCosts, creditsEnforced } from "@/lib/server/credits";

export const runtime = "nodejs";

/** GET — credit balance, allowance, recent ledger and current costs. */
export const GET = handler(async ({ user }) => {
  const account = getAccount(user!.id, user!.plan);
  return ok({
    account,
    enforced: creditsEnforced(),
    history: creditHistory(user!.id, 30),
    costs: getCosts(),
    exampleCost: costOf("ai-image"),
  });
}, { auth: true });

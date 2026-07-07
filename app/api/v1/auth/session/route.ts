import { handler, ok } from "@/lib/server/api";
import { enabledProviders } from "@/lib/server/auth";

export const runtime = "nodejs";

/** Current session (null = guest mode) + which auth providers are enabled. */
export const GET = handler(async ({ user }) => ok({ user, providers: enabledProviders() }));

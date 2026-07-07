import { NextRequest, NextResponse } from "next/server";
import { loginWithProvider } from "@/lib/server/auth";
import { track } from "@/lib/server/analytics";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/**
 * OAuth code flow for Google + GitHub — zero-dependency implementation.
 *   GET /api/v1/auth/oauth/google         → redirect to consent screen
 *   GET /api/v1/auth/oauth/google?code=…  → exchange, provision, sign in
 * Enabled automatically when GOOGLE_/GITHUB_ CLIENT_ID + CLIENT_SECRET exist.
 */
const CONFIGS = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
    id: () => process.env.GOOGLE_CLIENT_ID,
    secret: () => process.env.GOOGLE_CLIENT_SECRET,
  },
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    scope: "read:user user:email",
    id: () => process.env.GITHUB_CLIENT_ID,
    secret: () => process.env.GITHUB_CLIENT_SECRET,
  },
} as const;

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const cfg = CONFIGS[provider as keyof typeof CONFIGS];
  if (!cfg || !cfg.id() || !cfg.secret()) {
    return NextResponse.redirect(new URL("/login?error=provider_not_configured", SITE_URL));
  }
  const redirectUri = `${SITE_URL}/api/v1/auth/oauth/${provider}`;
  const code = req.nextUrl.searchParams.get("code");

  // Phase 1 — send the user to the consent screen.
  if (!code) {
    const u = new URL(cfg.authUrl);
    u.searchParams.set("client_id", cfg.id()!);
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", cfg.scope);
    return NextResponse.redirect(u);
  }

  // Phase 2 — exchange the code, read the profile, sign in.
  try {
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        client_id: cfg.id()!, client_secret: cfg.secret()!,
        code, redirect_uri: redirectUri, grant_type: "authorization_code",
      }),
    });
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) throw new Error("no_token");

    const userRes = await fetch(cfg.userUrl, { headers: { Authorization: `Bearer ${token.access_token}`, "User-Agent": "QRix" } });
    const profile = (await userRes.json()) as { email?: string | null; name?: string | null; login?: string };

    let email = profile.email;
    if (!email && provider === "github") {
      // GitHub may hide the email — fetch the verified primary.
      const emails = (await (await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${token.access_token}`, "User-Agent": "QRix" },
      })).json()) as { email: string; primary: boolean; verified: boolean }[];
      email = emails.find?.((e) => e.primary && e.verified)?.email || emails[0]?.email;
    }
    if (!email) throw new Error("no_email");

    await loginWithProvider(provider as "google" | "github", email, profile.name || profile.login || undefined);
    track("signup", { meta: { provider } });
    return NextResponse.redirect(new URL("/dashboard", SITE_URL));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", SITE_URL));
  }
}

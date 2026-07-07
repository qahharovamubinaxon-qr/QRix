/**
 * Authentication + session layer. Resolves the current user from the real
 * Supabase session when configured, otherwise from a signed mock cookie so the
 * app is fully usable in local/guest mode. Exposes provider + credential flows
 * as an abstraction that a NextAuth/Auth.js adapter can later fulfil verbatim.
 * SERVER ONLY.
 */
import { cookies } from "next/headers";
import { serverConfig } from "./config";
import { db, uid, helpers } from "./db";
import { hashPassword, verifyPassword, randomToken, isAdminEmail, sha256 } from "./security";
import type { Role, Plan, User } from "./models";

export type SessionUser = { id: string; email: string; name?: string | null; role: Role; plan: Plan; guest?: boolean };

const COOKIE = "qrix_session";

export type AuthProvider = "credentials" | "google" | "github" | "email";
export const enabledProviders = (): AuthProvider[] =>
  (Object.entries(serverConfig.auth.providers).filter(([, on]) => on).map(([k]) => k) as AuthProvider[]);

// ── Session resolution ──────────────────────────────────────────────────
/** The current signed-in user, or null. Guest mode is represented by null. */
export async function getSession(): Promise<SessionUser | null> {
  // Real path: Supabase session cookie.
  if (serverConfig.auth.supabase) {
    try {
      const { createClient } = await import("@/lib/supabase-server");
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email || "";
        return {
          id: data.user.id,
          email,
          name: (data.user.user_metadata?.name as string) || null,
          role: isAdminEmail(email) ? "ADMIN" : "USER",
          plan: (data.user.user_metadata?.plan as Plan) || "FREE",
        };
      }
    } catch { /* fall through to mock */ }
  }

  // Mock path: signed session cookie -> device session -> user.
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const parsed = await verifyCookie(raw);
  if (!parsed) return null;
  // Revocable device session: the cookie is only valid while its session row lives.
  const session = db.sessions.find((s) => s.token === parsed.id);
  if (!session || session.expiresAt < helpers.now()) return null;
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan };
}

// ── Device sessions ─────────────────────────────────────────────────────
export function listSessions(userId: string) {
  return db.sessions.filter((s) => s.userId === userId).map(({ token, ...s }) => { void token; return s; });
}
export function revokeSession(userId: string, sessionId: string): boolean {
  return db.sessions.remove((s) => s.userId === userId && s.id === sessionId) > 0;
}
export function revokeOtherSessions(userId: string, keepToken?: string): number {
  return db.sessions.remove((s) => s.userId === userId && s.token !== keepToken);
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSession();
  if (!u) throw new Error("unauthorized");
  return u;
}
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("forbidden");
  return u;
}

// ── Signed mock cookie (HMAC via sha256 over secret) ────────────────────
async function signCookie(id: string): Promise<string> {
  const payload = `${id}.${Date.now()}`;
  const sig = await sha256(`${payload}.${serverConfig.auth.secret}`);
  return `${btoa(payload)}.${sig.slice(0, 32)}`;
}
async function verifyCookie(raw: string): Promise<{ id: string } | null> {
  const [b64, sig] = raw.split(".");
  if (!b64 || !sig) return null;
  const payload = atob(b64);
  const expected = (await sha256(`${payload}.${serverConfig.auth.secret}`)).slice(0, 32);
  if (sig !== expected) return null;
  return { id: payload.split(".")[0] };
}

async function setSessionCookie(userId: string, rememberMe: boolean, meta?: { ip?: string; userAgent?: string }) {
  // Create a revocable device session; the cookie carries its token, signed.
  const token = randomToken(16);
  db.sessions.insert({
    id: uid("ses"), userId, token, ip: meta?.ip ?? null, userAgent: meta?.userAgent ?? null,
    rememberMe, createdAt: helpers.now(),
    expiresAt: helpers.daysAhead(rememberMe ? serverConfig.auth.sessionDays : 1),
  });
  const jar = await cookies();
  jar.set(COOKIE, await signCookie(token), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: rememberMe ? serverConfig.auth.sessionDays * 86400 : undefined,
  });
}

// ── Credential + provider flows (mock driver) ───────────────────────────
export async function registerWithPassword(email: string, password: string, name?: string): Promise<User> {
  if (db.users.find((u) => u.email === email.toLowerCase())) throw new Error("email_taken");
  const user: User = {
    id: uid("usr"), email: email.toLowerCase(), name: name || email.split("@")[0],
    role: isAdminEmail(email) ? "ADMIN" : "USER", plan: "FREE",
    passwordHash: await hashPassword(password), emailVerified: null,
    createdAt: helpers.now(), updatedAt: helpers.now(),
  };
  db.users.insert(user);
  return user;
}

export async function loginWithPassword(email: string, password: string, rememberMe = false): Promise<SessionUser> {
  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) throw new Error("invalid_credentials");
  await setSessionCookie(user.id, rememberMe);
  return { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan };
}

/** OAuth (google/github) — in mock mode, provisions/links a user by email. */
export async function loginWithProvider(provider: AuthProvider, email: string, name?: string): Promise<SessionUser> {
  let user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user) {
    user = {
      id: uid("usr"), email: email.toLowerCase(), name: name || email.split("@")[0],
      role: isAdminEmail(email) ? "ADMIN" : "USER", plan: "FREE", emailVerified: helpers.now(),
      createdAt: helpers.now(), updatedAt: helpers.now(),
    };
    db.users.insert(user);
  }
  await setSessionCookie(user.id, true);
  return { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan };
}

/** Issue a one-time token (magic-link / verify-email / password-reset). */
const tokens = new Map<string, { email: string; purpose: string; exp: number }>();
export function issueToken(email: string, purpose: "magic-link" | "verify-email" | "reset-password"): string {
  const token = randomToken(20);
  tokens.set(token, { email: email.toLowerCase(), purpose, exp: Date.now() + 30 * 60_000 });
  return token;
}
export function consumeToken(token: string, purpose: string): string | null {
  const t = tokens.get(token);
  if (!t || t.purpose !== purpose || t.exp < Date.now()) return null;
  tokens.delete(token);
  return t.email;
}

export async function logout() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) {
    const parsed = await verifyCookie(raw);
    if (parsed) db.sessions.remove((s) => s.token === parsed.id);
  }
  jar.delete(COOKIE);
}

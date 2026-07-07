/**
 * REST toolkit: typed JSON responses, error handling, validation, pagination
 * and a route wrapper that applies rate limiting + auth + uniform errors.
 * SERVER ONLY.
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./security";
import { getSession, type SessionUser } from "./auth";
import { audit } from "./analytics";
import { log } from "./logger";
import { authenticateApiKey } from "./api-keys";
import { db } from "./db";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message || code);
  }
}
export const badRequest = (m?: string) => new ApiError(400, "bad_request", m);
export const unauthorized = (m?: string) => new ApiError(401, "unauthorized", m);
export const forbidden = (m?: string) => new ApiError(403, "forbidden", m);
export const notFound = (m?: string) => new ApiError(404, "not_found", m);
export const tooMany = (m?: string) => new ApiError(429, "rate_limited", m);

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, data }, init);
export const fail = (e: ApiError) => NextResponse.json({ ok: false, error: e.code, message: e.message }, { status: e.status });

/** Cursor/offset pagination parsed from the query string. */
export function pagination(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 20)));
  return { page, limit, skip: (page - 1) * limit, q: sp.get("q")?.trim() || "", sort: sp.get("sort") || "" };
}

export function paginate<T>(rows: T[], page: number, limit: number) {
  const total = rows.length;
  return {
    items: rows.slice((page - 1) * limit, (page - 1) * limit + limit),
    page, limit, total, pages: Math.ceil(total / limit) || 1,
  };
}

// ── Tiny schema validator (no dependency) ───────────────────────────────
type Rule = { type: "string" | "number" | "boolean" | "email"; optional?: boolean; min?: number; max?: number; enum?: readonly string[] };
export type Schema = Record<string, Rule>;

export function validate<T = Record<string, unknown>>(body: unknown, schema: Schema): T {
  if (typeof body !== "object" || body === null) throw badRequest("invalid body");
  const src = body as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, rule] of Object.entries(schema)) {
    const v = src[key];
    if (v === undefined || v === null || v === "") {
      if (rule.optional) continue;
      throw badRequest(`missing field: ${key}`);
    }
    if (rule.type === "email") {
      if (typeof v !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) throw badRequest(`invalid email: ${key}`);
    } else if (rule.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) throw badRequest(`invalid number: ${key}`);
      if (rule.min !== undefined && n < rule.min) throw badRequest(`${key} too small`);
      out[key] = n; continue;
    } else if (typeof v !== rule.type) {
      throw badRequest(`invalid ${rule.type}: ${key}`);
    }
    if (typeof v === "string") {
      if (rule.min && v.length < rule.min) throw badRequest(`${key} too short`);
      if (rule.max && v.length > rule.max) throw badRequest(`${key} too long`);
      if (rule.enum && !rule.enum.includes(v)) throw badRequest(`invalid ${key}`);
    }
    out[key] = v;
  }
  return out as T;
}

export const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";

type Ctx = { req: NextRequest; user: SessionUser | null; params: Record<string, string> };
type Handler = (ctx: Ctx) => Promise<NextResponse> | NextResponse;
type Options = { auth?: boolean; admin?: boolean; rateLimit?: { max: number; windowMs?: number }; action?: string };

/**
 * Wrap a route handler with rate limiting, session resolution, role checks and
 * uniform error responses. Keeps individual routes tiny and consistent.
 */
export function handler(fn: Handler, opts: Options = {}) {
  return async (req: NextRequest, context: { params?: Promise<Record<string, string>> }) => {
    try {
      const ip = clientIp(req);

      // Public API: `Authorization: Bearer qrix_live_…` authenticates as the
      // key's owner. Rate limits then apply per key (and per workspace when
      // an X-Workspace-Id header is present) instead of per IP.
      let apiUser: SessionUser | null = null;
      let rlId = `${ip}:${req.nextUrl.pathname}`;
      const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(qrix_live_\w+)$/i)?.[1];
      if (bearer) {
        const scope: "read" | "write" = ["GET", "HEAD"].includes(req.method) ? "read" : "write";
        const key = await authenticateApiKey(bearer, scope);
        if (!key) throw unauthorized("invalid api key");
        const owner = db.users.find((u) => u.id === key.userId);
        if (!owner) throw unauthorized("key owner missing");
        apiUser = { id: owner.id, email: owner.email, name: owner.name, role: owner.role, plan: owner.plan };
        const wsId = req.headers.get("x-workspace-id");
        rlId = wsId ? `ws:${wsId}` : `key:${key.id}`;
      }

      const rl = await rateLimit(rlId, opts.rateLimit);
      if (!rl.ok) throw tooMany();

      const user = apiUser ?? (await getSession());
      if ((opts.auth || opts.admin) && !user) throw unauthorized();
      if (opts.admin && user?.role !== "ADMIN") throw forbidden("admin only");

      const params = context?.params ? await context.params : {};
      const res = await fn({ req, user, params });
      if (opts.action && user) audit(user.id, opts.action, req.nextUrl.pathname, ip);
      res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
      return res;
    } catch (e) {
      if (e instanceof ApiError) return fail(e);
      log.error("api_unhandled", { path: req.nextUrl.pathname, error: e instanceof Error ? e.message : String(e) });
      return fail(new ApiError(500, "server_error"));
    }
  };
}

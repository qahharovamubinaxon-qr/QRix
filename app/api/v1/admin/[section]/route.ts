import { handler, ok, notFound, badRequest, pagination, paginate } from "@/lib/server/api";
import { db, helpers } from "@/lib/server/db";
import { overview, series, topTools } from "@/lib/server/analytics";
import { listPosts, createPost, updatePost, deletePost, categories } from "@/lib/server/cms";
import { providerStatus, updateProviderSettings } from "@/lib/server/ai/manager";
import type { ProviderId } from "@/lib/server/ai/providers";
import { PROVIDERS } from "@/lib/server/ai/providers";
import { videoProviderStatus } from "@/lib/server/providers/video";
import { imageProviderStatus } from "@/lib/server/providers/image";
import { serverConfig, isLive } from "@/lib/server/config";
import { cleanupExpired } from "@/lib/server/storage";
import { systemHealth } from "@/lib/server/monitor";
import { creditStats, setCost, grantCredits } from "@/lib/server/credits";
import { refundOrder } from "@/lib/server/billing";
import type { Plan, Role } from "@/lib/server/models";

export const runtime = "nodejs";

/** Admin API — GET /api/v1/admin/{section}. RBAC enforced by the wrapper. */
export const GET = handler(async ({ req, params }) => {
  const { page, limit, q } = pagination(req);
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());

  switch (params.section) {
    case "overview":
      return ok({
        ...overview(),
        signups: series("signup", 30),
        toolUse: series("tool_use", 30),
        downloads: series("download", 30),
        topTools: topTools(8),
      });
    case "users": {
      let rows = db.users.all();
      if (q) rows = rows.filter((u) => match(u.email) || match(u.name || ""));
      const plan = req.nextUrl.searchParams.get("plan");
      if (plan) rows = rows.filter((u) => u.plan === plan);
      return ok(paginate(rows.map(({ passwordHash, ...u }) => { void passwordHash; return u; }), page, limit));
    }
    case "subscriptions":
      return ok(paginate(db.subscriptions.all(), page, limit));
    case "payments": {
      let rows = db.orders.all();
      if (q) rows = rows.filter((o) => match(o.userId) || match(o.status));
      return ok(paginate(rows, page, limit));
    }
    case "posts":
      return ok(paginate(await listPosts({ q, status: req.nextUrl.searchParams.get("status") || undefined }), page, limit));
    case "categories":
      return ok(await categories());
    case "tools": {
      const rows = topTools(50, 90);
      return ok(paginate(q ? rows.filter((t) => match(t.tool)) : rows, page, limit));
    }
    case "flags":
      return ok(db.flags.all());
    case "ai-providers":
      return ok(await providerStatus());
    case "logs": {
      let rows = db.audit.all();
      if (q) rows = rows.filter((l) => match(l.action) || match(l.target || ""));
      return ok(paginate(rows, page, limit));
    }
    case "jobs":
      return ok(paginate(db.jobs.all(), page, limit));
    case "keys":
      return ok(paginate(db.apiKeys.all().map(({ hash, ...k }) => { void hash; return k; }), page, limit));
    case "status": {
      const health = await systemHealth();
      return ok({
        drivers: {
          db: serverConfig.db.driver, cache: serverConfig.cache.driver, queue: serverConfig.queue.driver,
          storage: serverConfig.storage.driver, billing: serverConfig.billing.driver, email: serverConfig.email.driver,
        },
        live: isLive,
        providers: { ai: await providerStatus(), video: videoProviderStatus(), image: imageProviderStatus() },
        storage: { uploads: db.uploads.count(), bytes: db.uploads.all().reduce((s, u) => s + u.size, 0) },
        apiUsage: { keys: db.apiKeys.count(), requests: db.apiKeys.all().reduce((s, k) => s + k.requests, 0) },
        uptime: process.uptime(),
        health,
      });
    }
    case "credits":
      return ok(creditStats());
    case "workspaces": {
      let rows = db.workspaces.all();
      if (q) rows = rows.filter((w) => w.name.toLowerCase().includes(q.toLowerCase()) || w.slug.includes(q.toLowerCase()));
      return ok(paginate(rows.map((w) => ({
        ...w,
        members: db.wsMembers.count((m) => m.workspaceId === w.id && m.status === "active"),
        projects: db.wsProjects.count((p) => p.workspaceId === w.id),
        pendingInvites: db.wsInvites.count((i) => i.workspaceId === w.id && i.status === "pending"),
      })), page, limit));
    }
    default:
      throw notFound("unknown section");
  }
}, { admin: true });

/** POST — mutations per section. */
export const POST = handler(async ({ req, params, user }) => {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  switch (params.section) {
    case "users": {
      const id = String(body.id || "");
      const patch: { role?: Role; plan?: Plan } = {};
      if (body.role && ["USER", "ADMIN"].includes(String(body.role))) patch.role = body.role as Role;
      if (body.plan && ["FREE", "PRO", "BUSINESS", "ENTERPRISE"].includes(String(body.plan))) patch.plan = body.plan as Plan;
      const updated = db.users.update((u) => u.id === id, { ...patch, updatedAt: helpers.now() });
      if (!updated) throw notFound("user not found");
      return ok({ id: updated.id, role: updated.role, plan: updated.plan });
    }
    case "flags": {
      const key = String(body.key || "");
      if (!key) throw badRequest("key required");
      const existing = db.flags.find((f) => f.key === key);
      if (existing) db.flags.update((f) => f.key === key, { enabled: !!body.enabled, rollout: Math.min(100, Math.max(0, Number(body.rollout ?? existing.rollout))), updatedAt: helpers.now() });
      else db.flags.insert({ key, enabled: !!body.enabled, rollout: Number(body.rollout || 0), updatedAt: helpers.now() });
      return ok(db.flags.find((f) => f.key === key));
    }
    case "posts": {
      if (body.id) {
        const updated = await updatePost(String(body.id), body as never);
        if (!updated) throw notFound("post not found");
        return ok(updated);
      }
      if (!body.title || !body.slug) throw badRequest("title + slug required");
      return ok(await createPost(body as never & { title: string; slug: string }));
    }
    case "credits": {
      // Admin-tunable credit costs + manual grants.
      if (body.action && typeof body.cost === "number") { setCost(String(body.action), Math.max(0, body.cost)); return ok(creditStats()); }
      if (body.userId && typeof body.grant === "number") return ok({ balance: grantCredits(String(body.userId), body.grant, "admin-grant") });
      throw badRequest("action+cost or userId+grant required");
    }
    case "payments": {
      if (body.refund && body.orderId) return ok({ refunded: refundOrder(String(body.orderId)) });
      throw badRequest("refund+orderId required");
    }
    case "ai-providers": {
      const id = String(body.id || "") as ProviderId;
      if (!PROVIDERS[id]) throw badRequest("unknown provider");
      // Connection test: fire a tiny prompt through this provider only.
      if (body.test) {
        const t0 = Date.now();
        try {
          const key = process.env[PROVIDERS[id].envKey]?.trim();
          if (!key) return ok({ id, test: "no_key" });
          await PROVIDERS[id].call(PROVIDERS[id].capabilities[0], { prompt: "ping", maxTokens: 8 }, key);
          return ok({ id, test: "ok", latencyMs: Date.now() - t0 });
        } catch (e) {
          return ok({ id, test: "failed", error: e instanceof Error ? e.message.slice(0, 160) : "error", latencyMs: Date.now() - t0 });
        }
      }
      await updateProviderSettings(id, {
        enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
        primary: typeof body.primary === "boolean" ? body.primary : undefined,
        backup: typeof body.backup === "boolean" ? body.backup : undefined,
        // apiKey is encrypted at rest and never echoed back
        apiKey: typeof body.apiKey === "string" ? (body.apiKey || null) : undefined,
      });
      return ok((await providerStatus()).find((p) => p.id === id));
    }
    case "workspaces": {
      // Admin: change plan / credit pool / kind of any workspace.
      const wsId = String(body.id || "");
      const patch: Record<string, unknown> = {};
      if (body.plan && ["FREE", "PRO", "BUSINESS", "ENTERPRISE"].includes(String(body.plan))) patch.plan = body.plan;
      if (typeof body.creditPool === "number") patch.creditPool = Math.max(0, body.creditPool);
      if (body.kind && ["personal", "team", "organization", "enterprise"].includes(String(body.kind))) patch.kind = body.kind;
      const updated = db.workspaces.update((w) => w.id === wsId, patch);
      if (!updated) throw notFound("workspace not found");
      return ok(updated);
    }
    case "cleanup":
      return ok({ purged: await cleanupExpired(), by: user!.email });
    default:
      throw notFound("unknown section");
  }
}, { admin: true, action: "admin.mutate" });

export const DELETE = handler(async ({ req, params }) => {
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) throw badRequest("id required");
  switch (params.section) {
    case "posts": return ok({ deleted: await deletePost(id) });
    case "users": return ok({ deleted: db.users.remove((u) => u.id === id && u.role !== "ADMIN") > 0 });
    default: throw notFound("unknown section");
  }
}, { admin: true, action: "admin.delete" });

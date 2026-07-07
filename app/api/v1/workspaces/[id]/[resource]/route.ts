import { handler, ok, notFound, forbidden, badRequest, pagination, paginate } from "@/lib/server/api";
import { db } from "@/lib/server/db";
import {
  can, inviteMember, setMemberRole, setMemberStatus, removeMember,
  saveProject, restoreVersion, addComment, permissionsFor, logActivity,
  type Module, type Ability,
} from "@/lib/server/workspaces";
import { sanitize } from "@/lib/server/security";

export const runtime = "nodejs";

/** Workspace sub-resources: members · invites · roles · projects · comments · activity · permissions.
    Every access is workspace-isolated and permission-checked. */

function guard(wsId: string, userId: string, module: Module, ability: Ability) {
  if (!db.workspaces.find((w) => w.id === wsId)) throw notFound("workspace not found");
  if (!can(wsId, userId, module, ability)) throw forbidden("insufficient permissions");
}

export const GET = handler(async ({ req, user, params }) => {
  const { id, resource } = params;
  const { page, limit, q } = pagination(req);
  guard(id, user!.id, "workspace", "view");

  switch (resource) {
    case "members":
      return ok(db.wsMembers.filter((m) => m.workspaceId === id && (!q || m.email.includes(q.toLowerCase()))));
    case "invites":
      return ok(db.wsInvites.filter((i) => i.workspaceId === id && i.status === "pending").map(({ token, ...i }) => ({ ...i, token: can(id, user!.id, "workspace", "manage") ? token : undefined })));
    case "roles": {
      const custom = db.wsRoles.filter((r) => r.workspaceId === id);
      return ok({ builtin: ["owner", "admin", "manager", "editor", "viewer"], custom });
    }
    case "projects":
      return ok(paginate(db.wsProjects.filter((p) => p.workspaceId === id && (!q || p.name.toLowerCase().includes(q.toLowerCase()))).map((p) => ({ ...p, versions: p.versions.map(({ data, ...v }) => { void data; return v; }) })), page, limit));
    case "comments": {
      const projectId = req.nextUrl.searchParams.get("project") || "";
      return ok(db.wsComments.filter((c) => c.workspaceId === id && (!projectId || c.projectId === projectId)));
    }
    case "activity":
      return ok(paginate(db.wsActivity.filter((a) => a.workspaceId === id), page, limit));
    case "permissions": {
      const me = db.wsMembers.find((m) => m.workspaceId === id && m.userId === user!.id);
      return ok({ role: me?.role, permissions: me ? permissionsFor(id, me.role) : {} });
    }
    default:
      throw notFound("unknown resource");
  }
}, { auth: true });

export const POST = handler(async ({ req, user, params }) => {
  const { id, resource } = params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  switch (resource) {
    case "invites": {
      guard(id, user!.id, "workspace", "manage");
      const ws = db.workspaces.find((w) => w.id === id)!;
      if (!ws.settings.allowInvites) throw badRequest("invites disabled");
      const email = sanitize(String(body.email || ""), 120);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw badRequest("valid email required");
      return ok(inviteMember(id, user!.id, email, String(body.role || ws.settings.defaultRole)));
    }
    case "members": {
      guard(id, user!.id, "workspace", "manage");
      const memberId = String(body.memberId || "");
      if (body.role) return ok({ updated: setMemberRole(id, memberId, String(body.role)) });
      if (body.status === "suspended" || body.status === "active") return ok({ updated: setMemberStatus(id, memberId, body.status) });
      throw badRequest("role or status required");
    }
    case "roles": {
      guard(id, user!.id, "workspace", "manage");
      const name = sanitize(String(body.name || ""), 40);
      if (!name || ["owner", "admin", "manager", "editor", "viewer"].includes(name)) throw badRequest("invalid custom role name");
      const permissions = (typeof body.permissions === "object" && body.permissions ? body.permissions : {}) as Record<Module, Ability[]>;
      const existing = db.wsRoles.find((r) => r.workspaceId === id && r.name === name);
      if (existing) { db.wsRoles.update((r) => r.id === existing.id, { permissions }); return ok(db.wsRoles.find((r) => r.id === existing.id)); }
      const role = { id: `role_${Date.now().toString(36)}`, workspaceId: id, name, permissions };
      db.wsRoles.insert(role);
      logActivity(id, user!.id, "role.created", name);
      return ok(role);
    }
    case "projects": {
      guard(id, user!.id, (String(body.module || "qr") as Module), body.id ? "edit" : "create");
      if (body.restoreVersion !== undefined && body.id) {
        const restored = restoreVersion(id, user!.id, String(body.id), Number(body.restoreVersion));
        if (!restored) throw notFound("version not found");
        return ok(restored);
      }
      return ok(saveProject(id, user!.id, { id: body.id ? String(body.id) : undefined, name: body.name ? String(body.name) : undefined, kind: body.kind ? String(body.kind) : undefined, data: body.data, note: body.note ? String(body.note) : undefined }));
    }
    case "comments": {
      guard(id, user!.id, "workspace", "view");
      const projectId = String(body.projectId || "");
      const text = String(body.body || "").trim();
      if (!projectId || !text) throw badRequest("projectId + body required");
      return ok(addComment(id, projectId, user!.id, text, body.parentId ? String(body.parentId) : undefined));
    }
    default:
      throw notFound("unknown resource");
  }
}, { auth: true, action: "workspace.mutate" });

export const DELETE = handler(async ({ req, user, params }) => {
  const { id, resource } = params;
  const targetId = req.nextUrl.searchParams.get("id") || "";
  guard(id, user!.id, "workspace", "manage");

  switch (resource) {
    case "members": return ok({ removed: removeMember(id, targetId) });
    case "invites": return ok({ removed: db.wsInvites.remove((i) => i.workspaceId === id && i.id === targetId) > 0 });
    case "roles": return ok({ removed: db.wsRoles.remove((r) => r.workspaceId === id && r.id === targetId) > 0 });
    case "projects": return ok({ removed: db.wsProjects.remove((p) => p.workspaceId === id && p.id === targetId) > 0 });
    case "comments": return ok({ removed: db.wsComments.remove((c) => c.workspaceId === id && c.id === targetId) > 0 });
    default: throw notFound("unknown resource");
  }
}, { auth: true, action: "workspace.delete_resource" });

import { handler, ok, notFound, forbidden, badRequest } from "@/lib/server/api";
import { db } from "@/lib/server/db";
import { workspaceDashboard, updateWorkspace, transferOwnership, can, assertPermission, logActivity } from "@/lib/server/workspaces";

export const runtime = "nodejs";

/** GET — workspace dashboard (analytics, usage, activity). Members only. */
export const GET = handler(async ({ user, params }) => {
  const ws = db.workspaces.find((w) => w.id === params.id);
  if (!ws) throw notFound("workspace not found");
  if (!can(ws.id, user!.id, "workspace", "view")) throw forbidden("not a member");
  return ok(workspaceDashboard(ws.id));
}, { auth: true });

/** PUT — settings/branding/profile; {transferTo} moves ownership. Owner/admin only. */
export const PUT = handler(async ({ req, user, params }) => {
  const ws = db.workspaces.find((w) => w.id === params.id);
  if (!ws) throw notFound("workspace not found");
  try { assertPermission(ws.id, user!.id, "workspace", "manage"); } catch { throw forbidden(); }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (body.transferTo) {
    if (ws.ownerId !== user!.id) throw forbidden("owner only");
    if (!transferOwnership(ws.id, user!.id, String(body.transferTo))) throw badRequest("target must be an active member");
    return ok({ transferred: true });
  }
  const updated = updateWorkspace(ws.id, {
    name: typeof body.name === "string" ? body.name.slice(0, 80) : undefined,
    logo: typeof body.logo === "string" ? body.logo.slice(0, 200_000) : undefined,
    brandColor: typeof body.brandColor === "string" ? body.brandColor.slice(0, 20) : undefined,
    profile: typeof body.profile === "object" ? (body.profile as { website?: string }) : undefined,
    settings: typeof body.settings === "object" && body.settings ? (body.settings as { defaultRole: string; allowInvites: boolean }) : undefined,
  });
  logActivity(ws.id, user!.id, "workspace.updated");
  return ok(updated);
}, { auth: true, action: "workspace.update" });

/** DELETE — owner only; personal workspaces cannot be deleted. */
export const DELETE = handler(async ({ user, params }) => {
  const ws = db.workspaces.find((w) => w.id === params.id);
  if (!ws) throw notFound("workspace not found");
  if (ws.ownerId !== user!.id) throw forbidden("owner only");
  if (ws.kind === "personal") throw badRequest("personal workspace cannot be deleted");
  db.workspaces.remove((w) => w.id === ws.id);
  db.wsMembers.remove((m) => m.workspaceId === ws.id);
  db.wsInvites.remove((i) => i.workspaceId === ws.id);
  db.wsProjects.remove((p) => p.workspaceId === ws.id);
  return ok({ deleted: true });
}, { auth: true, action: "workspace.delete" });

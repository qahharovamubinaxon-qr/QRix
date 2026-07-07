import { handler, ok, validate } from "@/lib/server/api";
import { createWorkspace, ensurePersonal, listWorkspaces, respondInvite } from "@/lib/server/workspaces";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";

/** GET — the caller's workspaces (personal auto-provisioned) + pending invites. */
export const GET = handler(async ({ user }) => {
  ensurePersonal(user!.id, user!.email);
  const invites = db.wsInvites.filter((i) => i.email === user!.email.toLowerCase() && i.status === "pending")
    .map((i) => ({ id: i.id, token: i.token, role: i.role, workspace: db.workspaces.find((w) => w.id === i.workspaceId)?.name }));
  return ok({ workspaces: listWorkspaces(user!.id), invites });
}, { auth: true });

/** POST — create a workspace, or respond to an invite ({inviteToken, accept}). */
export const POST = handler(async ({ req, user }) => {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.inviteToken) {
    const member = respondInvite(String(body.inviteToken), user!.id, user!.email, body.accept !== false);
    return ok({ joined: !!member, member });
  }
  const v = validate<{ name: string; kind?: string }>(body, {
    name: { type: "string", min: 2, max: 80 },
    kind: { type: "string", optional: true, enum: ["personal", "team", "organization", "enterprise"] },
  });
  return ok(createWorkspace(user!.id, user!.email, v.name, (v.kind as "team") || "team"));
}, { auth: true, action: "workspace.create" });

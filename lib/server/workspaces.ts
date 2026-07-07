/**
 * Workspace core — collaborative layer turning QRix into a multi-tenant SaaS.
 *
 * Kinds: personal · team · organization · enterprise. Organization/enterprise
 * workspaces carry branding, billing plan, credit pool and storage quota.
 * Members hold a role (owner/admin/manager/editor/viewer or a custom role)
 * that resolves to granular per-module permissions. Shared projects carry
 * full version history; every action lands in the activity log. All queries
 * are workspace-isolated: callers must go through `assertPermission`.
 * SERVER ONLY.
 */
import { db, uid, helpers } from "./db";
import { track } from "./analytics";
import { randomToken } from "./security";
import type { Plan } from "./models";

export type WorkspaceKind = "personal" | "team" | "organization" | "enterprise";
export type RoleName = "owner" | "admin" | "manager" | "editor" | "viewer" | string;
export type Module = "qr" | "pdf" | "image" | "video" | "ai" | "3d" | "api" | "workspace";
export type Ability = "view" | "create" | "edit" | "delete" | "manage";

export interface Workspace {
  id: string;
  kind: WorkspaceKind;
  name: string;
  slug: string;
  ownerId: string;
  logo?: string | null;      // data-URL or storage URL
  brandColor?: string | null;
  profile?: { website?: string; description?: string } | null;
  plan: Plan;
  creditPool: number;        // organization-level credits
  storageQuotaMb: number;
  settings: { defaultRole: RoleName; allowInvites: boolean };
  createdAt: string;
}

export interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  role: RoleName;
  status: "active" | "suspended";
  joinedAt: string;
}

export interface Invite {
  id: string;
  workspaceId: string;
  email: string;
  role: RoleName;
  token: string;
  invitedBy: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface CustomRole {
  id: string;
  workspaceId: string;
  name: string;
  permissions: Partial<Record<Module, Ability[]>>;
}

export interface WsProject {
  id: string;
  workspaceId: string;
  name: string;
  kind: string; // qr | pdf | image | video | ai | template | preset | asset
  data: unknown;
  shared: { favorites: boolean; history: boolean };
  createdBy: string;
  updatedAt: string;
  createdAt: string;
  versions: { v: number; data: unknown; by: string; at: string; note?: string }[];
}

export interface WsComment {
  id: string;
  workspaceId: string;
  projectId: string;
  parentId?: string | null;   // reply thread
  authorId: string;
  body: string;
  mentions: string[];         // userIds
  createdAt: string;
}

export interface WsActivity {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  target?: string | null;
  createdAt: string;
}

// ── Role → permission resolution ────────────────────────────────────────
const ALL: Ability[] = ["view", "create", "edit", "delete", "manage"];
const MODULES: Module[] = ["qr", "pdf", "image", "video", "ai", "3d", "api", "workspace"];

const BUILTIN: Record<string, Partial<Record<Module, Ability[]>>> = {
  owner: Object.fromEntries(MODULES.map((m) => [m, ALL])),
  admin: Object.fromEntries(MODULES.map((m) => [m, ALL])),
  manager: { ...Object.fromEntries(MODULES.map((m) => [m, ["view", "create", "edit", "delete"] as Ability[]])), workspace: ["view", "manage"] },
  editor: Object.fromEntries(MODULES.map((m) => [m, m === "workspace" ? ["view"] : (["view", "create", "edit"] as Ability[])])),
  viewer: Object.fromEntries(MODULES.map((m) => [m, ["view"] as Ability[]])),
};

export function permissionsFor(workspaceId: string, role: RoleName): Partial<Record<Module, Ability[]>> {
  if (BUILTIN[role]) return BUILTIN[role];
  const custom = db.wsRoles.find((r) => r.workspaceId === workspaceId && r.name === role);
  return custom?.permissions ?? BUILTIN.viewer;
}

export function can(workspaceId: string, userId: string, module: Module, ability: Ability): boolean {
  const m = db.wsMembers.find((x) => x.workspaceId === workspaceId && x.userId === userId && x.status === "active");
  if (!m) return false;
  return (permissionsFor(workspaceId, m.role)[module] ?? []).includes(ability);
}

export function assertPermission(workspaceId: string, userId: string, module: Module, ability: Ability): Member {
  const m = db.wsMembers.find((x) => x.workspaceId === workspaceId && x.userId === userId && x.status === "active");
  if (!m || !(permissionsFor(workspaceId, m.role)[module] ?? []).includes(ability)) throw new Error("forbidden");
  return m;
}

export function logActivity(workspaceId: string, actorId: string, action: string, target?: string) {
  db.wsActivity.insert({ id: uid("act"), workspaceId, actorId, action, target: target ?? null, createdAt: helpers.now() });
}

// ── Workspaces ──────────────────────────────────────────────────────────
const QUOTA: Record<WorkspaceKind, number> = { personal: 100, team: 5_000, organization: 100_000, enterprise: 1_000_000 };

export function createWorkspace(ownerId: string, ownerEmail: string, name: string, kind: WorkspaceKind = "team"): Workspace {
  const ws: Workspace = {
    id: uid("ws"), kind, name: name.slice(0, 80),
    slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${uid("").slice(3, 7)}`,
    ownerId, logo: null, brandColor: null, profile: null,
    plan: "FREE", creditPool: 0, storageQuotaMb: QUOTA[kind],
    settings: { defaultRole: "editor", allowInvites: true },
    createdAt: helpers.now(),
  };
  db.workspaces.insert(ws);
  db.wsMembers.insert({ id: uid("mem"), workspaceId: ws.id, userId: ownerId, email: ownerEmail, role: "owner", status: "active", joinedAt: helpers.now() });
  logActivity(ws.id, ownerId, "workspace.created", ws.name);
  track("workspace_created", { userId: ownerId, meta: { kind } });
  return ws;
}

/** Every user implicitly has a personal workspace — provision on first touch. */
export function ensurePersonal(userId: string, email: string): Workspace {
  const existing = db.workspaces.find((w) => w.ownerId === userId && w.kind === "personal");
  if (existing) return existing;
  return createWorkspace(userId, email, "Personal", "personal");
}

export const listWorkspaces = (userId: string): (Workspace & { role: RoleName })[] =>
  db.wsMembers.filter((m) => m.userId === userId && m.status === "active")
    .map((m) => {
      const ws = db.workspaces.find((w) => w.id === m.workspaceId);
      return ws ? { ...ws, role: m.role } : null;
    })
    .filter((w): w is Workspace & { role: RoleName } => !!w);

export function updateWorkspace(id: string, patch: Partial<Pick<Workspace, "name" | "logo" | "brandColor" | "profile" | "settings" | "kind" | "plan">>): Workspace | null {
  return db.workspaces.update((w) => w.id === id, patch) ?? null;
}

export function transferOwnership(workspaceId: string, fromId: string, toUserId: string): boolean {
  const target = db.wsMembers.find((m) => m.workspaceId === workspaceId && m.userId === toUserId && m.status === "active");
  if (!target) return false;
  db.workspaces.update((w) => w.id === workspaceId, { ownerId: toUserId });
  db.wsMembers.update((m) => m.workspaceId === workspaceId && m.userId === toUserId, { role: "owner" });
  db.wsMembers.update((m) => m.workspaceId === workspaceId && m.userId === fromId, { role: "admin" });
  logActivity(workspaceId, fromId, "workspace.ownership_transferred", toUserId);
  return true;
}

// ── Invites ─────────────────────────────────────────────────────────────
export function inviteMember(workspaceId: string, invitedBy: string, email: string, role: RoleName): Invite {
  const inv: Invite = {
    id: uid("inv"), workspaceId, email: email.toLowerCase(), role,
    token: randomToken(16), invitedBy, status: "pending", createdAt: helpers.now(),
  };
  db.wsInvites.insert(inv);
  logActivity(workspaceId, invitedBy, "member.invited", email);
  return inv;
}

export function respondInvite(token: string, userId: string, email: string, accept: boolean): Member | null {
  const inv = db.wsInvites.find((i) => i.token === token && i.status === "pending");
  if (!inv) return null;
  db.wsInvites.update((i) => i.id === inv.id, { status: accept ? "accepted" : "rejected" });
  if (!accept) { logActivity(inv.workspaceId, userId, "member.invite_rejected", email); return null; }
  const member: Member = { id: uid("mem"), workspaceId: inv.workspaceId, userId, email, role: inv.role, status: "active", joinedAt: helpers.now() };
  db.wsMembers.insert(member);
  logActivity(inv.workspaceId, userId, "member.joined", email);
  notifyMembers(inv.workspaceId, userId, "New member", `${email} joined the workspace`);
  return member;
}

export function setMemberStatus(workspaceId: string, memberId: string, status: "active" | "suspended"): boolean {
  return !!db.wsMembers.update((m) => m.workspaceId === workspaceId && m.id === memberId && m.role !== "owner", { status });
}
export function setMemberRole(workspaceId: string, memberId: string, role: RoleName): boolean {
  return !!db.wsMembers.update((m) => m.workspaceId === workspaceId && m.id === memberId && m.role !== "owner", { role });
}
export function removeMember(workspaceId: string, memberId: string): boolean {
  return db.wsMembers.remove((m) => m.workspaceId === workspaceId && m.id === memberId && m.role !== "owner") > 0;
}

// ── Projects + versions ─────────────────────────────────────────────────
export function saveProject(workspaceId: string, userId: string, input: { id?: string; name?: string; kind?: string; data?: unknown; note?: string }): WsProject {
  if (input.id) {
    const p = db.wsProjects.find((x) => x.id === input.id && x.workspaceId === workspaceId);
    if (!p) throw new Error("not_found");
    const nextV = (p.versions[0]?.v ?? 0) + 1;
    p.versions.unshift({ v: nextV, data: input.data ?? p.data, by: userId, at: helpers.now(), note: input.note });
    db.wsProjects.update((x) => x.id === p.id, {
      name: input.name ?? p.name, data: input.data ?? p.data,
      versions: p.versions.slice(0, 50), updatedAt: helpers.now(),
    });
    logActivity(workspaceId, userId, "project.updated", p.name);
    return db.wsProjects.find((x) => x.id === p.id)!;
  }
  const proj: WsProject = {
    id: uid("wsp"), workspaceId, name: (input.name || "Untitled").slice(0, 100), kind: input.kind || "qr",
    data: input.data ?? {}, shared: { favorites: true, history: true },
    createdBy: userId, createdAt: helpers.now(), updatedAt: helpers.now(),
    versions: [{ v: 1, data: input.data ?? {}, by: userId, at: helpers.now(), note: "created" }],
  };
  db.wsProjects.insert(proj);
  logActivity(workspaceId, userId, "project.created", proj.name);
  return proj;
}

export function restoreVersion(workspaceId: string, userId: string, projectId: string, v: number): WsProject | null {
  const p = db.wsProjects.find((x) => x.id === projectId && x.workspaceId === workspaceId);
  const ver = p?.versions.find((x) => x.v === v);
  if (!p || !ver) return null;
  return saveProject(workspaceId, userId, { id: projectId, data: ver.data, note: `restored v${v}` });
}

// ── Comments + mentions ─────────────────────────────────────────────────
export function addComment(workspaceId: string, projectId: string, authorId: string, body: string, parentId?: string): WsComment {
  const mentions = [...body.matchAll(/@([\w.+-]+@[\w.-]+|\w+)/g)].map((m) => m[1]);
  const mentionIds = db.wsMembers.filter((m) => m.workspaceId === workspaceId && (mentions.includes(m.email) || mentions.includes(m.email.split("@")[0]))).map((m) => m.userId);
  const c: WsComment = { id: uid("cmt"), workspaceId, projectId, parentId: parentId ?? null, authorId, body: body.slice(0, 2000), mentions: mentionIds, createdAt: helpers.now() };
  db.wsComments.insert(c);
  logActivity(workspaceId, authorId, parentId ? "comment.replied" : "comment.added", projectId);
  for (const uid_ of mentionIds) {
    db.notifications.insert({ id: uid("ntf"), userId: uid_, kind: "workspace", title: "You were mentioned", body: body.slice(0, 140), read: false, createdAt: helpers.now() });
  }
  return c;
}

function notifyMembers(workspaceId: string, exceptUserId: string, title: string, body: string) {
  for (const m of db.wsMembers.filter((x) => x.workspaceId === workspaceId && x.status === "active" && x.userId !== exceptUserId)) {
    db.notifications.insert({ id: uid("ntf"), userId: m.userId, kind: "workspace", title, body, read: false, createdAt: helpers.now() });
  }
}

// ── Workspace dashboard ─────────────────────────────────────────────────
export function workspaceDashboard(workspaceId: string) {
  const members = db.wsMembers.filter((m) => m.workspaceId === workspaceId);
  const projects = db.wsProjects.filter((p) => p.workspaceId === workspaceId);
  const activity = db.wsActivity.filter((a) => a.workspaceId === workspaceId);
  const ws = db.workspaces.find((w) => w.id === workspaceId);
  const memberIds = new Set(members.map((m) => m.userId));
  const events = db.events.all().filter((e) => e.userId && memberIds.has(e.userId));
  const toolCounts = new Map<string, number>();
  for (const e of events) if (e.name === "tool_use" && e.tool) toolCounts.set(e.tool, (toolCounts.get(e.tool) || 0) + 1);
  const spend = db.creditLedger.all().filter((e) => memberIds.has(e.userId) && e.amount < 0).reduce((s, e) => s - e.amount, 0);
  const storage = db.uploads.all().filter((u) => memberIds.has(u.userId)).reduce((s, u) => s + u.size, 0);

  return {
    workspace: ws,
    counts: { members: members.filter((m) => m.status === "active").length, suspended: members.filter((m) => m.status === "suspended").length, projects: projects.length },
    creditUsage: { pool: ws?.creditPool ?? 0, spent: spend },
    storageUsage: { bytes: storage, quotaMb: ws?.storageQuotaMb ?? 0 },
    topTools: [...toolCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tool, count]) => ({ tool, count })),
    memberActivity: members.map((m) => ({ email: m.email, role: m.role, status: m.status, actions: activity.filter((a) => a.actorId === m.userId).length })),
    recentActivity: activity.slice(0, 20),
  };
}

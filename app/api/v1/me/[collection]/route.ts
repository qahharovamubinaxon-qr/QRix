import { handler, ok, badRequest, notFound, pagination, paginate } from "@/lib/server/api";
import { db, uid, helpers } from "@/lib/server/db";
import { sanitize } from "@/lib/server/security";

export const runtime = "nodejs";

/** Generic user-data collections: favorites · history · recents · downloads ·
    projects · templates · bookmarks · notifications. GET (paginated + q filter),
    POST (add/upsert), DELETE (?id= single, otherwise clear). */

type Store = { rows: () => { id: string; userId: string }[]; add: (userId: string, body: Record<string, unknown>) => unknown; removeAll: (userId: string) => void; removeOne: (userId: string, id: string) => boolean };

const text = (v: unknown, max = 300) => sanitize(String(v ?? ""), max);

function store(name: string): Store | null {
  switch (name) {
    case "favorites": return {
      rows: () => db.favorites.all(),
      add: (userId, b) => {
        const href = text(b.href); if (!href) throw badRequest("href required");
        db.favorites.remove((f) => f.userId === userId && f.href === href);
        return db.favorites.insert({ id: uid("fav"), userId, href, title: text(b.title, 120) || href, group: text(b.group, 60) || null, createdAt: helpers.now() });
      },
      removeAll: (userId) => db.favorites.remove((f) => f.userId === userId),
      removeOne: (userId, id) => db.favorites.remove((f) => f.userId === userId && (f.id === id || f.href === id)) > 0,
    };
    case "history": return {
      rows: () => db.history.all(),
      add: (userId, b) => db.history.insert({ id: uid("job"), userId, tool: text(b.tool, 120) || "tool", file: text(b.file, 200) || null, href: text(b.href, 200) || null, status: ["done", "error", "processing"].includes(String(b.status)) ? String(b.status) : "done", createdAt: helpers.now() }),
      removeAll: (userId) => db.history.remove((h) => h.userId === userId),
      removeOne: (userId, id) => db.history.remove((h) => h.userId === userId && h.id === id) > 0,
    };
    case "recents": return {
      rows: () => db.recents.all(),
      add: (userId, b) => {
        const href = text(b.href); if (!href) throw badRequest("href required");
        db.recents.remove((r) => r.userId === userId && r.href === href);
        return db.recents.insert({ id: uid("rec"), userId, href, title: text(b.title, 120) || href, group: text(b.group, 60) || null, usedAt: helpers.now() });
      },
      removeAll: (userId) => db.recents.remove((r) => r.userId === userId),
      removeOne: (userId, id) => db.recents.remove((r) => r.userId === userId && r.id === id) > 0,
    };
    case "downloads": return {
      rows: () => db.downloads.all(),
      add: (userId, b) => db.downloads.insert({ id: uid("dl"), userId, name: text(b.name, 160) || "file", tool: text(b.tool, 120) || null, size: Math.max(0, Number(b.size) || 0), createdAt: helpers.now() }),
      removeAll: (userId) => db.downloads.remove((d) => d.userId === userId),
      removeOne: (userId, id) => db.downloads.remove((d) => d.userId === userId && d.id === id) > 0,
    };
    case "projects": return {
      rows: () => db.projects.all(),
      add: (userId, b) => db.projects.insert({ id: uid("prj"), userId, name: text(b.name, 120) || "Untitled", kind: text(b.kind, 20) || "qr", data: b.data ?? null, createdAt: helpers.now(), updatedAt: helpers.now() }),
      removeAll: (userId) => db.projects.remove((p) => p.userId === userId),
      removeOne: (userId, id) => db.projects.remove((p) => p.userId === userId && p.id === id) > 0,
    };
    case "templates": return {
      rows: () => db.templates.all(),
      add: (userId, b) => db.templates.insert({ id: uid("tpl"), userId, kind: text(b.kind, 20) || "qr", name: text(b.name, 120) || "Template", data: b.data ?? {}, createdAt: helpers.now() }),
      removeAll: (userId) => db.templates.remove((t) => t.userId === userId),
      removeOne: (userId, id) => db.templates.remove((t) => t.userId === userId && t.id === id) > 0,
    };
    case "bookmarks": return {
      rows: () => db.bookmarks.all(),
      add: (userId, b) => {
        const slug = text(b.slug, 160); if (!slug) throw badRequest("slug required");
        db.bookmarks.remove((x) => x.userId === userId && x.slug === slug);
        return db.bookmarks.insert({ id: uid("bmk"), userId, slug, title: text(b.title, 160) || slug, createdAt: helpers.now() });
      },
      removeAll: (userId) => db.bookmarks.remove((x) => x.userId === userId),
      removeOne: (userId, id) => db.bookmarks.remove((x) => x.userId === userId && (x.id === id || x.slug === id)) > 0,
    };
    case "notifications": return {
      rows: () => db.notifications.all(),
      add: (userId, b) => db.notifications.insert({ id: uid("ntf"), userId, kind: text(b.kind, 20) || "system", title: text(b.title, 120) || "Notification", body: text(b.body, 400) || null, read: false, createdAt: helpers.now() }),
      removeAll: (userId) => db.notifications.remove((n) => n.userId === userId),
      removeOne: (userId, id) => !!db.notifications.update((n) => n.userId === userId && n.id === id, { read: true }),
    };
    default: return null;
  }
}

export const GET = handler(async ({ req, user, params }) => {
  const s = store(params.collection);
  if (!s) throw notFound("unknown collection");
  const { page, limit, q } = pagination(req);
  let rows = s.rows().filter((r) => r.userId === user!.id);
  if (q) rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return ok(paginate(rows, page, limit));
}, { auth: true });

export const POST = handler(async ({ req, user, params }) => {
  const s = store(params.collection);
  if (!s) throw notFound("unknown collection");
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return ok(s.add(user!.id, body));
}, { auth: true });

export const DELETE = handler(async ({ req, user, params }) => {
  const s = store(params.collection);
  if (!s) throw notFound("unknown collection");
  const id = req.nextUrl.searchParams.get("id");
  if (id) return ok({ removed: s.removeOne(user!.id, id) });
  s.removeAll(user!.id);
  return ok({ cleared: true });
}, { auth: true });

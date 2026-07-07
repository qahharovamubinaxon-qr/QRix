import { handler, ok } from "@/lib/server/api";
import { db } from "@/lib/server/db";
import { getSubscription, listOrders, planLimits, checkJobQuota } from "@/lib/server/billing";
import { storageUsage } from "@/lib/server/storage";
import { listJobs } from "@/lib/server/queue";

export const runtime = "nodejs";

/** GET — full dashboard payload: profile, subscription, usage, activity. */
export const GET = handler(async ({ user }) => {
  const u = user!;
  const favorites = db.favorites.filter((f) => f.userId === u.id);
  const recents = db.recents.filter((r) => r.userId === u.id).slice(0, 10);
  const history = db.history.filter((h) => h.userId === u.id).slice(0, 20);
  const downloads = db.downloads.filter((d) => d.userId === u.id);
  const projects = db.projects.filter((p) => p.userId === u.id);
  const notifications = db.notifications.filter((n) => n.userId === u.id && !n.read).length;

  return ok({
    profile: u,
    subscription: getSubscription(u.id),
    orders: listOrders(u.id),
    limits: planLimits(u.plan),
    quota: checkJobQuota(u.id, u.plan),
    storage: storageUsage(u.id),
    jobs: listJobs(u.id).slice(0, 10),
    counts: { favorites: favorites.length, downloads: downloads.length, projects: projects.length, unread: notifications },
    favorites: favorites.slice(0, 8),
    recents,
    history,
  });
}, { auth: true });

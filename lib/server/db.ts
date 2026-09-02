/**
 * Data-access layer. Ships with an in-memory mock driver seeded with demo data
 * so the whole platform (dashboard, admin, analytics, API) works out of the box.
 * When DATABASE_URL is set, the same repository interface is intended to be
 * backed by Prisma — call sites never change. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { loadUsers, profilesConfigured, pushInsert, pushUpdate, pushDelete } from "./db-profiles";
import type {
  User, Subscription, Order, ApiKey, Job, Notification, Settings, Favorite,
  HistoryItem, RecentTool, Download, Upload, Project, EventRow, FeatureFlag,
  Post, AuditLog, SavedTemplate, BlogBookmark,
} from "./models";

export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

/** Minimal typed in-memory collection with the query surface the app needs.
 *
 *  `sync` lets a collection be backed by a real table without changing any of
 *  the 28 files that call these methods. It cannot be awaited here — every
 *  method is synchronous by contract — so writes go to memory immediately and
 *  are pushed onward in the background. See db-profiles.ts for what that costs
 *  and why it is still the right trade at this size. */
type SyncHooks<T> = {
  insert?: (row: T) => void;
  update?: (row: T, patch: Partial<T>) => void;
  remove?: (row: T) => void;
};

class Collection<T> {
  private rows: T[] = [];
  private sync?: SyncHooks<T>;
  constructor(seed: T[] = [], sync?: SyncHooks<T>) { this.rows = seed; this.sync = sync; }
  /** Replace the contents wholesale — used once at boot when a real table
      has been read, so the seeded demo rows never reach a caller. */
  hydrate(rows: T[]) { this.rows = rows; }
  all() { return [...this.rows]; }
  find(pred: (r: T) => boolean) { return this.rows.find(pred); }
  filter(pred: (r: T) => boolean) { return this.rows.filter(pred); }
  count(pred?: (r: T) => boolean) { return pred ? this.rows.filter(pred).length : this.rows.length; }
  insert(row: T) { this.rows.unshift(row); this.sync?.insert?.(row); return row; }
  update(pred: (r: T) => boolean, patch: Partial<T>) {
    const r = this.rows.find(pred);
    if (r) { Object.assign(r, patch); this.sync?.update?.(r, patch); }
    return r;
  }
  remove(pred: (r: T) => boolean) {
    const doomed = this.rows.filter(pred);
    this.rows = this.rows.filter((r) => !pred(r));
    for (const r of doomed) this.sync?.remove?.(r);
    return doomed.length;
  }
}

// ── Seed data (mock driver only) ────────────────────────────────────────────
const seedUsers: User[] = [
  { id: "usr_admin", email: "musarasulzada@gmail.com", name: "Musa", role: "ADMIN", plan: "ENTERPRISE", emailVerified: daysAgo(120), createdAt: daysAgo(120), updatedAt: now() },
  { id: "usr_demo1", email: "alex@example.com", name: "Alex Rivera", role: "USER", plan: "PRO", emailVerified: daysAgo(40), createdAt: daysAgo(40), updatedAt: now() },
  { id: "usr_demo2", email: "sam@example.com", name: "Sam Lee", role: "USER", plan: "FREE", emailVerified: daysAgo(12), createdAt: daysAgo(12), updatedAt: now() },
  { id: "usr_demo3", email: "jo@example.com", name: "Jo Park", role: "USER", plan: "BUSINESS", emailVerified: daysAgo(6), createdAt: daysAgo(6), updatedAt: now() },
];

const seedSubs: Subscription[] = [
  { id: "sub_1", userId: "usr_demo1", plan: "PRO", status: "ACTIVE", interval: "MONTH", currentPeriodEnd: daysAhead(18), cancelAtPeriodEnd: false, createdAt: daysAgo(40) },
  { id: "sub_2", userId: "usr_demo3", plan: "BUSINESS", status: "TRIALING", interval: "YEAR", trialEnd: daysAhead(9), currentPeriodEnd: daysAhead(9), cancelAtPeriodEnd: false, createdAt: daysAgo(6) },
];

const seedOrders: Order[] = [
  { id: "ord_1", userId: "usr_demo1", amount: 500, currency: "usd", status: "paid", createdAt: daysAgo(40), invoiceUrl: "#" },
  { id: "ord_2", userId: "usr_demo1", amount: 500, currency: "usd", status: "paid", createdAt: daysAgo(10), invoiceUrl: "#" },
  { id: "ord_3", userId: "usr_demo3", amount: 4900, currency: "usd", status: "paid", createdAt: daysAgo(6), invoiceUrl: "#" },
];

function seedEvents(): EventRow[] {
  const tools = ["/qr-tools/url", "/pdf-tools/merge", "/image-tools/remove-bg", "/ai-tools/image-upscaler", "/video-tools/trim", "/qr-tools/wifi", "/pdf-tools/compress"];
  const names = ["tool_use", "download", "page_view", "signup", "conversion"];
  const countries = ["US", "DE", "UZ", "RU", "IN", "BR", "GB", "JP", "FR", "TR"];
  const devices = ["desktop", "mobile", "mobile", "desktop", "tablet"];
  const browsers = ["Chrome", "Chrome", "Safari", "Firefox", "Edge"];
  const referrers = ["google", "direct", "direct", "twitter", "producthunt", "reddit"];
  const out: EventRow[] = [];
  for (let d = 29; d >= 0; d--) {
    const volume = 40 + Math.round(Math.sin(d / 4) * 20) + (29 - d);
    for (let i = 0; i < volume; i++) {
      out.push({
        id: uid("evt"), name: names[i % (i % 7 === 0 ? 5 : 3)], tool: tools[i % tools.length],
        createdAt: daysAgo(d), userId: seedUsers[i % seedUsers.length].id,
        meta: {
          country: countries[(i * 7 + d) % countries.length],
          device: devices[(i * 3 + d) % devices.length],
          browser: browsers[(i * 5 + d) % browsers.length],
          referrer: referrers[(i * 11 + d) % referrers.length],
          hour: (i * 13 + d * 5) % 24,
        },
      });
    }
  }
  return out;
}

// ── Store ────────────────────────────────────────────────────────────────
export const db = {
  users: new Collection<User>(seedUsers, {
    insert: (u) => pushInsert(u),
    update: (u, patch) => pushUpdate(u.id, patch),
    remove: (u) => pushDelete(u.id),
  }),
  subscriptions: new Collection<Subscription>(seedSubs),
  orders: new Collection<Order>(seedOrders),
  apiKeys: new Collection<ApiKey>([]),
  jobs: new Collection<Job>([]),
  notifications: new Collection<Notification>([]),
  settings: new Collection<Settings & { id: string }>([]),
  favorites: new Collection<Favorite>([]),
  history: new Collection<HistoryItem>([]),
  recents: new Collection<RecentTool>([]),
  downloads: new Collection<Download>([]),
  uploads: new Collection<Upload>([]),
  projects: new Collection<Project>([]),
  events: new Collection<EventRow>(seedEvents()),
  flags: new Collection<FeatureFlag>([
    { key: "cloud-ai", enabled: false, rollout: 0, updatedAt: now() },
    { key: "video-export", enabled: false, rollout: 0, updatedAt: now() },
    { key: "api-keys", enabled: true, rollout: 100, updatedAt: now() },
    { key: "referrals", enabled: true, rollout: 100, updatedAt: now() },
  ]),
  posts: new Collection<Post>([]),
  audit: new Collection<AuditLog>([]),
  templates: new Collection<SavedTemplate>([]),
  bookmarks: new Collection<BlogBookmark>([]),
  aiProviders: new Collection<import("./ai/manager").ProviderSettings>([]),
  credits: new Collection<import("./credits").CreditAccount>([]),
  creditLedger: new Collection<import("./credits").CreditEntry>([]),
  creditCosts: new Collection<{ action: string; cost: number }>([]),
  sessions: new Collection<import("./models").DeviceSession>([]),
  workspaces: new Collection<import("./workspaces").Workspace>([]),
  wsMembers: new Collection<import("./workspaces").Member>([]),
  wsInvites: new Collection<import("./workspaces").Invite>([]),
  wsRoles: new Collection<import("./workspaces").CustomRole>([]),
  wsProjects: new Collection<import("./workspaces").WsProject>([]),
  wsComments: new Collection<import("./workspaces").WsComment>([]),
  wsActivity: new Collection<import("./workspaces").WsActivity>([]),
  webhooks: new Collection<import("./webhooks").Webhook>([]),
  webhookDeliveries: new Collection<import("./webhooks").WebhookDelivery>([]),
};

/* Boot-time hydration.
   Top-level await, so no request can observe the seeded demo users once a real
   table is reachable. It costs one round trip per lambda instance, bounded by
   the timeout inside loadUsers — a slow Supabase must not hang every route.

   A null result means "could not look", NOT "no users": in that case the seed
   is left alone rather than replaced with an empty list, because an empty
   /admin is indistinguishable from a site with no accounts and would be read
   as the latter. */
if (profilesConfigured()) {
  const real = await loadUsers();
  if (real) db.users.hydrate(real);
}

export const dbDriver = serverConfig.db.driver;
export const helpers = { now, daysAgo, daysAhead };

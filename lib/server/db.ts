/**
 * Data-access layer. Ships with an in-memory mock driver seeded with demo data
 * so the whole platform (dashboard, admin, analytics, API) works out of the box.
 * When DATABASE_URL is set, the same repository interface is intended to be
 * backed by Prisma — call sites never change. SERVER ONLY.
 */
import { serverConfig } from "./config";
import type {
  User, Subscription, Order, ApiKey, Job, Notification, Settings, Favorite,
  HistoryItem, RecentTool, Download, Upload, Project, EventRow, FeatureFlag,
  Post, AuditLog,
} from "./models";

export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

/** Minimal typed in-memory collection with the query surface the app needs. */
class Collection<T extends { id?: string }> {
  private rows: T[] = [];
  constructor(seed: T[] = []) { this.rows = seed; }
  all() { return [...this.rows]; }
  find(pred: (r: T) => boolean) { return this.rows.find(pred); }
  filter(pred: (r: T) => boolean) { return this.rows.filter(pred); }
  count(pred?: (r: T) => boolean) { return pred ? this.rows.filter(pred).length : this.rows.length; }
  insert(row: T) { this.rows.unshift(row); return row; }
  update(pred: (r: T) => boolean, patch: Partial<T>) {
    const r = this.rows.find(pred);
    if (r) Object.assign(r, patch);
    return r;
  }
  remove(pred: (r: T) => boolean) {
    const before = this.rows.length;
    this.rows = this.rows.filter((r) => !pred(r));
    return before - this.rows.length;
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
  const tools = ["/qr-tools/url", "/pdf-tools/merge", "/image-tools/remove-bg", "/ai-tools/image-upscaler", "/video-tools/trim"];
  const names = ["tool_use", "download", "page_view", "signup", "conversion"];
  const out: EventRow[] = [];
  for (let d = 29; d >= 0; d--) {
    const volume = 40 + Math.round(Math.sin(d / 4) * 20) + (29 - d);
    for (let i = 0; i < volume; i++) {
      out.push({ id: uid("evt"), name: names[i % (i % 7 === 0 ? 5 : 3)], tool: tools[i % tools.length], createdAt: daysAgo(d), userId: seedUsers[i % seedUsers.length].id });
    }
  }
  return out;
}

// ── Store ────────────────────────────────────────────────────────────────
export const db = {
  users: new Collection<User>(seedUsers),
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
};

export const dbDriver = serverConfig.db.driver;
export const helpers = { now, daysAgo, daysAhead };

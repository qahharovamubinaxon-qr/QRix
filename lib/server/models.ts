/** Shared TypeScript types mirroring prisma/schema.prisma. Framework-agnostic
    so both the mock driver and a future Prisma driver satisfy the same shapes. */

export type Role = "USER" | "ADMIN";
export type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
export type Interval = "MONTH" | "YEAR";
export type SubStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type JobKind = "IMAGE" | "VIDEO" | "AI" | "PDF" | "QR";
export type JobStatus = "QUEUED" | "PROCESSING" | "DONE" | "FAILED" | "CANCELED";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  passwordHash?: string | null;
  emailVerified?: string | null;
  plan: Plan;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: SubStatus;
  interval: Interval;
  stripeCustomerId?: string | null;
  stripeSubId?: string | null;
  currentPeriodEnd?: string | null;
  trialEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string | null;
  couponCode?: string | null;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  hash: string;
  scopes: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  requests: number;
  revoked: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  userId?: string | null;
  kind: JobKind;
  tool: string;
  status: JobStatus;
  progress: number;
  input?: unknown;
  output?: unknown;
  error?: string | null;
  attempts: number;
  provider?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  kind: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string;
}

export interface Settings {
  userId: string;
  theme: string;
  language: string;
  animations: boolean;
  performance: boolean;
  notifications: boolean;
  reduceData: boolean;
}

export interface Favorite { id: string; userId: string; href: string; title: string; group?: string | null; createdAt: string; }
export interface HistoryItem { id: string; userId: string; tool: string; file?: string | null; href?: string | null; status: string; createdAt: string; }
export interface RecentTool { id: string; userId: string; href: string; title: string; group?: string | null; usedAt: string; }
export interface Download { id: string; userId: string; name: string; tool?: string | null; size: number; createdAt: string; }
export interface Upload { id: string; userId: string; key: string; name: string; mime: string; size: number; temporary: boolean; expiresAt?: string | null; createdAt: string; }
export interface Project { id: string; userId: string; name: string; kind: string; data?: unknown; createdAt: string; updatedAt: string; }
export interface SavedTemplate { id: string; userId: string; kind: string; name: string; data: unknown; createdAt: string; }
export interface BlogBookmark { id: string; userId: string; slug: string; title: string; createdAt: string; }
export interface EventRow { id: string; name: string; userId?: string | null; tool?: string | null; meta?: unknown; createdAt: string; }
export interface FeatureFlag { key: string; enabled: boolean; rollout: number; updatedAt: string; }
export interface Post { id: string; slug: string; title: string; excerpt?: string | null; body?: string | null; category?: string | null; tags: string[]; status: string; featured: boolean; seoTitle?: string | null; seoDesc?: string | null; publishedAt?: string | null; createdAt: string; updatedAt: string; }
export interface AuditLog { id: string; actorId?: string | null; action: string; target?: string | null; ip?: string | null; meta?: unknown; createdAt: string; }

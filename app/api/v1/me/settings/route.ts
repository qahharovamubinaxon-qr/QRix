import { handler, ok, validate } from "@/lib/server/api";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";

const DEFAULTS = { theme: "system", language: "en", animations: true, performance: false, notifications: true, reduceData: false };

/** GET — persisted settings (theme, language, notifications, privacy). */
export const GET = handler(async ({ user }) => {
  const row = db.settings.find((s) => s.userId === user!.id);
  return ok(row ? { ...DEFAULTS, ...row } : { ...DEFAULTS, userId: user!.id });
}, { auth: true });

/** PUT — upsert settings; language preference persists in the database. */
export const PUT = handler(async ({ req, user }) => {
  const body = validate<Partial<typeof DEFAULTS>>(await req.json(), {
    theme: { type: "string", optional: true, enum: ["system", "dark", "light"] },
    language: { type: "string", optional: true, enum: ["en", "ru", "uz"] },
    animations: { type: "boolean", optional: true },
    performance: { type: "boolean", optional: true },
    notifications: { type: "boolean", optional: true },
    reduceData: { type: "boolean", optional: true },
  });
  const existing = db.settings.find((s) => s.userId === user!.id);
  if (existing) db.settings.update((s) => s.userId === user!.id, body);
  else db.settings.insert({ id: user!.id, userId: user!.id, ...DEFAULTS, ...body });
  return ok(db.settings.find((s) => s.userId === user!.id));
}, { auth: true, action: "settings.update" });

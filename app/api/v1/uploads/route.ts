import { handler, ok, badRequest, pagination, paginate } from "@/lib/server/api";
import { upload, removeUpload, storageUsage } from "@/lib/server/storage";
import { planLimits } from "@/lib/server/billing";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";

export const GET = handler(async ({ req, user }) => {
  const { page, limit } = pagination(req);
  const rows = db.uploads.filter((u) => u.userId === user!.id);
  return ok({ ...paginate(rows, page, limit), usage: storageUsage(user!.id) });
}, { auth: true });

/** POST multipart/form-data { file, temporary? } — upload via the storage driver. */
export const POST = handler(async ({ req, user }) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) throw badRequest("file required");
  const limitMb = planLimits(user!.plan).storageMb;
  const { bytes } = storageUsage(user!.id);
  if (bytes + file.size > limitMb * 1024 * 1024) throw badRequest(`storage limit ${limitMb}MB reached`);
  const rec = await upload(user!.id, file.name, file.type || "application/octet-stream", new Uint8Array(await file.arrayBuffer()), {
    temporary: form?.get("temporary") !== "false",
  });
  return ok(rec);
}, { auth: true, rateLimit: { max: 20 } });

export const DELETE = handler(async ({ req, user }) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw badRequest("id required");
  const rec = db.uploads.find((u) => u.id === id && u.userId === user!.id);
  if (!rec) return ok({ removed: false });
  await removeUpload(id);
  return ok({ removed: true });
}, { auth: true });

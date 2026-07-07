import { handler, ok, notFound, forbidden } from "@/lib/server/api";
import { getJob, cancelJob, retryJob } from "@/lib/server/queue";

export const runtime = "nodejs";

/** GET — poll job status/progress/output. */
export const GET = handler(async ({ user, params }) => {
  const job = getJob(params.id);
  if (!job) throw notFound("job not found");
  if (job.userId && job.userId !== user!.id && user!.role !== "ADMIN") throw forbidden();
  return ok(job);
}, { auth: true });

/** PUT — retry a failed job. */
export const PUT = handler(async ({ user, params }) => {
  const job = getJob(params.id);
  if (!job) throw notFound("job not found");
  if (job.userId !== user!.id && user!.role !== "ADMIN") throw forbidden();
  return ok({ retried: retryJob(params.id) });
}, { auth: true });

/** DELETE — cancel a queued/processing job. */
export const DELETE = handler(async ({ user, params }) => {
  const job = getJob(params.id);
  if (!job) throw notFound("job not found");
  if (job.userId !== user!.id && user!.role !== "ADMIN") throw forbidden();
  return ok({ canceled: cancelJob(params.id) });
}, { auth: true });

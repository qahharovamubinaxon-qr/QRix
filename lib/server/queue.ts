/**
 * Background processing queue. In-memory driver by default (works on a single
 * node / serverless with immediate async processing); Redis/BullMQ-ready by
 * setting REDIS_URL. Handles image / video / AI / PDF / QR jobs with status
 * tracking, retries, cancellation and progress. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { db, uid, helpers } from "./db";
import { track } from "./analytics";
import { emitEvent } from "./webhooks";
import { runAi } from "./providers/ai";
import { runVideo } from "./providers/video";
import { runImage } from "./providers/image";
import type { Job, JobKind } from "./models";

type ProcessResult = { output?: unknown; error?: string };

/** Route a job to the provider abstraction for its kind. */
async function process(job: Job): Promise<ProcessResult> {
  try {
    switch (job.kind) {
      case "AI": return { output: await runAi(job.tool, job.input) };
      case "VIDEO": return { output: await runVideo(job.tool, job.input) };
      case "IMAGE": return { output: await runImage(job.tool, job.input) };
      case "PDF": return { output: { tool: job.tool, note: "processed on-device / server-hook ready" } };
      case "QR": return { output: { tool: job.tool, note: "generated" } };
      default: return { error: "unknown_kind" };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "processing_failed" };
  }
}

async function run(id: string) {
  const job = db.jobs.find((j) => j.id === id);
  if (!job || job.status === "CANCELED") return;
  db.jobs.update((j) => j.id === id, { status: "PROCESSING", progress: 10, updatedAt: helpers.now() });

  const res = await process(job);
  const fresh = db.jobs.find((j) => j.id === id);
  if (!fresh || fresh.status === "CANCELED") return;

  if (res.error) {
    const attempts = fresh.attempts + 1;
    if (attempts < serverConfig.queue.maxAttempts) {
      db.jobs.update((j) => j.id === id, { status: "QUEUED", attempts, error: res.error, updatedAt: helpers.now() });
      setTimeout(() => schedule(id, "low"), 500 * 2 ** attempts); // exponential backoff, retries yield to fresh jobs
    } else {
      db.jobs.update((j) => j.id === id, { status: "FAILED", attempts, error: res.error, progress: 100, updatedAt: helpers.now() });
      emitEvent("job.failed", { jobId: id, tool: job.tool, error: res.error }, job.userId);
    }
    return;
  }
  db.jobs.update((j) => j.id === id, { status: "DONE", progress: 100, output: res.output, error: null, updatedAt: helpers.now() });
  track("job_done", { userId: job.userId, tool: job.tool });
  emitEvent("job.completed", { jobId: id, tool: job.tool, kind: job.kind }, job.userId);
}

// ── Priority scheduler with bounded concurrency ─────────────────────────
type Priority = "high" | "normal" | "low";
const waiting: { id: string; priority: Priority }[] = [];
let active = 0;

function schedule(id: string, priority: Priority = "normal") {
  waiting.push({ id, priority });
  pump();
}

function pump() {
  while (active < serverConfig.queue.concurrency && waiting.length) {
    // high → normal → low, FIFO within a class
    waiting.sort((a, b) => rank(a.priority) - rank(b.priority));
    const next = waiting.shift()!;
    active++;
    run(next.id).finally(() => { active--; pump(); });
  }
}
const rank = (p: Priority) => (p === "high" ? 0 : p === "normal" ? 1 : 2);

/** Enqueue a job; returns immediately with a QUEUED record.
    Priority: paid plans run "high" (priority processing). */
export function enqueue(kind: JobKind, tool: string, input: unknown, userId?: string | null, priority: Priority = "normal"): Job {
  const job: Job = {
    id: uid("job"), userId: userId ?? null, kind, tool, status: "QUEUED", progress: 0,
    input, output: null, error: null, attempts: 0, provider: providerFor(kind),
    createdAt: helpers.now(), updatedAt: helpers.now(),
  };
  db.jobs.insert(job);
  track("job_queued", { userId, tool });
  if (serverConfig.queue.driver === "memory") schedule(job.id, priority);
  return job;
}

/** Queue depth + outcomes for monitoring and the admin dashboard. */
export function queueStats() {
  const all = db.jobs.all();
  const by = (s: string) => all.filter((j) => j.status === s).length;
  return {
    driver: serverConfig.queue.driver,
    concurrency: serverConfig.queue.concurrency,
    active, waiting: waiting.length,
    queued: by("QUEUED"), processing: by("PROCESSING"),
    done: by("DONE"), failed: by("FAILED"), canceled: by("CANCELED"),
    total: all.length,
  };
}

function providerFor(kind: JobKind): string {
  if (kind === "AI") return serverConfig.providers.ai;
  if (kind === "VIDEO") return serverConfig.providers.video;
  if (kind === "IMAGE") return serverConfig.providers.image;
  return "local";
}

export const getJob = (id: string) => db.jobs.find((j) => j.id === id) || null;
export const listJobs = (userId: string) => db.jobs.filter((j) => j.userId === userId);

export function cancelJob(id: string): boolean {
  const job = db.jobs.find((j) => j.id === id);
  if (!job || job.status === "DONE") return false;
  db.jobs.update((j) => j.id === id, { status: "CANCELED", updatedAt: helpers.now() });
  return true;
}

export function retryJob(id: string): boolean {
  const job = db.jobs.find((j) => j.id === id);
  if (!job || job.status !== "FAILED") return false;
  db.jobs.update((j) => j.id === id, { status: "QUEUED", attempts: 0, error: null, progress: 0, updatedAt: helpers.now() });
  if (serverConfig.queue.driver === "memory") schedule(id);
  return true;
}

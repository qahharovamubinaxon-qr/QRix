import { callCron } from "./_cron.mts";

/** Purges expired temporary uploads; quiet hour so it never meets traffic. */
export default async () => callCron("/api/cron/cleanup");
export const config = { schedule: "0 3 * * *" };

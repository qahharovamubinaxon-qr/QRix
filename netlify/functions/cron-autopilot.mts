import { callCron } from "./_cron.mts";

/** Was `0 6 * * *` in vercel.json; unchanged, so the blog keeps its rhythm. */
export default async () => callCron("/api/cron/autopilot");
export const config = { schedule: "0 6 * * *" };

import { callCron } from "../lib/cron";

/* Purges expired temporary uploads. Never had a vercel.json entry, so it has
 * never run on a schedule; 03:00 UTC is the quietest hour for this audience. */
export default () => callCron("/api/cron/cleanup");

export const config = { schedule: "0 3 * * *" };

import { callCron } from "../lib/cron";

/* Was vercel.json's 06:00 UTC cron: one autopilot blog article per day (plus the Sunday backup). */
export default () => callCron("/api/cron/autopilot");

export const config = { schedule: "0 6 * * *" };

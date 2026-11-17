import { callCron } from "./_cron.mts";

/**
 * Not in vercel.json — added because its absence is what let a nine-day
 * outage pass unnoticed. It checks every subsystem and pings the owner on
 * Telegram when one degrades, and because that check reads the database it
 * also keeps a free Supabase project from idling into a pause.
 *
 * Every six hours: often enough that nothing sits broken for a day, far
 * enough apart that a flapping subsystem does not become a notification
 * storm.
 */
export default async () => callCron("/api/cron/watchdog");
export const config = { schedule: "0 */6 * * *" };

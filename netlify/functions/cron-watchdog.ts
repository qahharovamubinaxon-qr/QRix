import { callCron } from "../lib/cron";

/* Not one of the three vercel.json crons — added because their absence went
 * unnoticed for over two weeks.
 *
 * The scheduled functions have been answering 401 since they landed, because
 * CRON_SECRET was never set on Netlify. Nothing said so: these jobs fail
 * quietly, and no blog post, no Telegram report and no autopost each look like
 * an ordinary quiet day. Worse, those daily calls were the only thing touching
 * the database, and a free Supabase project pauses after seven idle days. It
 * paused on about 12 Nov, which killed every dynamic QR redirect and dropped
 * the blog's rows out of the sitemap (855 URLs -> 832). It was found by hand on
 * 18 Nov.
 *
 * /api/cron/watchdog already checks every subsystem and pings the owner on
 * Telegram when one degrades. It simply had nothing calling it. Every six hours
 * is often enough that nothing sits broken for a day, and far enough apart that
 * a flapping subsystem does not become a notification storm. Because the check
 * reads the database, it also keeps the project from idling into a pause. */
export default () => callCron("/api/cron/watchdog");

export const config = { schedule: "0 */6 * * *" };

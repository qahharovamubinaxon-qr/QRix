import { callCron } from "../lib/cron";

/* Was vercel.json's 07:00 UTC cron: the owner's daily Telegram report. */
export default () => callCron("/api/cron/telegram-reports?period=daily");

export const config = { schedule: "0 7 * * *" };

import { callCron } from "../lib/cron";

/* Was vercel.json's 09:00 UTC cron: the env-gated Telegram autoposter. */
export default () => callCron("/api/cron/social-post");

export const config = { schedule: "0 9 * * *" };

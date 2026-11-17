import { callCron } from "./_cron.mts";

export default async () => callCron("/api/cron/social-post");
export const config = { schedule: "0 9 * * *" };

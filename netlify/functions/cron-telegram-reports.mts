import { callCron } from "./_cron.mts";

export default async () => callCron("/api/cron/telegram-reports?period=daily");
export const config = { schedule: "0 7 * * *" };

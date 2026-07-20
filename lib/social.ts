/* QRix social presence — single source of truth for the Telegram links used in
   the footer, the downloader pages and the bot's own welcome card. */

/** Public channel (daily tool-of-the-day posts). */
export const TG_CHANNEL = "QRixtools";
/** Public downloader bot. Empty string hides the bot link everywhere. */
export const TG_BOT = "qrix_downloader_bot";

export const TG_CHANNEL_URL = `https://t.me/${TG_CHANNEL}`;
export const TG_BOT_URL = TG_BOT ? `https://t.me/${TG_BOT}` : "";

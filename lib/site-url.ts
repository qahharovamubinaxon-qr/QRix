export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // In local development, allow an explicit LAN-accessible host to be
  // provided so QR codes scanned from phones can reach the dev server.
  if (process.env.NEXT_PUBLIC_DEV_HOST) {
    return process.env.NEXT_PUBLIC_DEV_HOST.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

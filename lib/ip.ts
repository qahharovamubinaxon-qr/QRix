/**
 * GDPR data-minimisation for scan analytics.
 *
 * The full client IP is used only transiently (to resolve country/city) and is
 * never persisted. What we store is a coarsened address: IPv4 keeps the /24
 * network (a.b.c.0) and IPv6 keeps the first three hextets. That is enough to
 * distinguish rough origins without retaining a personal identifier.
 */
export function anonymizeIp(ip: string | null | undefined): string {
  const raw = (ip || "").trim();
  if (!raw || raw === "unknown") return "unknown";

  if (raw.includes(":")) {
    const hextets = raw.split(":").filter(Boolean);
    if (hextets.length === 0) return "unknown";
    return `${hextets.slice(0, 3).join(":")}::`;
  }

  const octets = raw.split(".");
  if (octets.length === 4 && octets.every((o) => /^\d{1,3}$/.test(o))) {
    return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
  }
  return "unknown";
}

/** The caller's IP from proxy headers (first hop in x-forwarded-for). */
export function clientIp(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { supabase as db } from "@/lib/supabase"; // service-role, for the RLS-locked dynamic_links
import { rateLimit, hashPassword } from "@/lib/server/security";

/** Reject loopback / private / link-local / metadata hosts, so the QRix domain
    can't be used to mask a redirect to an internal network resource. */
function isPublicHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return false;
  if (h === "::1" || h === "0.0.0.0") return false;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a === 0 || a === 10 || a === 127) return false;      // this-net / private / loopback
    if (a === 172 && b >= 16 && b <= 31) return false;        // 172.16.0.0/12
    if (a === 192 && b === 168) return false;                 // 192.168.0.0/16
    if (a === 169 && b === 254) return false;                 // link-local + cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return false;       // CGNAT 100.64.0.0/10
  }
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return false; // IPv6 ULA/link-local
  return true;
}

/** Only allow safe, public http(s) destinations — blocks javascript:, data:,
    and internal hosts. */
function isSafeUrl(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return isPublicHost(u.hostname);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Anti-abuse: links can be minted anonymously, so cap creation per IP —
  // otherwise the QRix domain could be used in bulk to host phishing redirects.
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const rl = await rateLimit(`dyn:${ip}`, { max: 20, windowMs: 3_600_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many links created. Please try again later." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const body = await req.json();
    const url = body?.url;
    const pinRaw = body?.pin;
    const customSlug = body?.customSlug;

    // ── validate destination URL (prevents open-redirect / phishing abuse) ──
    if (!isSafeUrl(url)) {
      return NextResponse.json({ error: "Invalid URL. Use a full http(s) link." }, { status: 400 });
    }

    // ── validate optional PIN (4–10 digits) — stored HASHED, never in cleartext ──
    let pin: string | null = null;
    if (pinRaw !== undefined && pinRaw !== null && pinRaw !== "") {
      const p = String(pinRaw);
      if (!/^\d{4,10}$/.test(p)) {
        return NextResponse.json({ error: "PIN must be 4–10 digits." }, { status: 400 });
      }
      pin = await hashPassword(p);
    }

    // ── validate / sanitize custom slug ──
    let slug: string;
    if (customSlug !== undefined && customSlug !== null && customSlug !== "") {
      if (!/^[a-zA-Z0-9_-]{3,40}$/.test(String(customSlug))) {
        return NextResponse.json({ error: "Custom alias may use letters, numbers, - and _ (3–40 chars)." }, { status: 400 });
      }
      slug = String(customSlug);
      const { data: existing } = await db
        .from("dynamic_links")
        .select("slug")
        .eq("slug", slug)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: "That alias is already taken." }, { status: 400 });
      }
    } else {
      slug = Math.random().toString(36).substring(2, 9);
    }

    const result = await db.from("dynamic_links").insert({
      slug,
      target_url: url,
      pin,
      user_id: session?.user?.id || null,
    });

    if (result.error) {
      return NextResponse.json({ error: "Could not create link." }, { status: 500 });
    }

    return NextResponse.json({ slug, dynamicUrl: pin ? `/pin/${slug}` : `/r/${slug}` });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

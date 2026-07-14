/**
 * The visitor's own coarse location, echoed back to them.
 *
 * This exists as a route rather than being read in the homepage's own render for
 * one reason: touching request headers in a page opts it out of static generation.
 * The homepage stays static and the map fetches its pin after mount.
 *
 * Nothing here is stored, logged, or shared. The IP resolves the city and is
 * discarded; the response is the city the visitor is already sitting in.
 */
import { NextRequest, NextResponse } from "next/server";
import { getGeo } from "@/lib/geoip";
import { clientIp } from "@/lib/ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // reads per-request headers

export async function GET(req: NextRequest) {
  const geo = await getGeo(req.headers, clientIp(req.headers));

  return NextResponse.json(
    { country: geo.country, city: geo.city, lat: geo.lat, lon: geo.lon },
    {
      headers: {
        // Per-visitor data: never let a CDN hand one person's city to the next.
        "Cache-Control": "private, no-store",
      },
    }
  );
}

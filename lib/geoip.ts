/**
 * Geo resolution for scan analytics.
 *
 * PRODUCTION (Vercel): the edge network already resolves the visitor's location
 * and passes it on the request as `x-vercel-ip-country` / `x-vercel-ip-city`.
 * Using those is free, instant, and — critically — avoids depending on the 63 MB
 * GeoLite2 database, which is NOT included in the serverless bundle (a
 * `process.cwd()` lookup there fails, so the old code silently returned null
 * country/city in production while still bloating the deployment).
 *
 * DEVELOPMENT: falls back to the local GeoLite2 city database. `maxmind` is
 * imported lazily so neither it nor the .mmdb is pulled into the production
 * bundle unless the fallback actually runs.
 */

export type Geo = {
  country: string | null;
  city: string | null;
  /** Coarse coordinates of the city, not of the visitor. Used to place the pin on
      the homepage world map; never persisted with the scan record. */
  lat: number | null;
  lon: number | null;
};

const EMPTY: Geo = { country: null, city: null, lat: null, lon: null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let reader: any = null;

/** Look the IP up in the local GeoLite2 database (development only). */
export async function getGeoData(ip: string): Promise<Geo> {
  try {
    if (!reader) {
      const [{ default: maxmind }, { default: path }] = await Promise.all([
        import("maxmind"),
        import("path"),
      ]);
      reader = await maxmind.open(path.join(process.cwd(), "geoip", "GeoLite2-City.mmdb"));
    }
    const result = reader.get(ip);
    return {
      country: result?.country?.names?.en || null,
      city: result?.city?.names?.en || null,
      lat: num(result?.location?.latitude),
      lon: num(result?.location?.longitude),
    };
  } catch {
    // No database available (e.g. serverless) — degrade quietly.
    return EMPTY;
  }
}

/**
 * Resolve geo for a request. Prefers the platform's own headers, falling back to
 * the local database. `ip` is only used by the fallback and is never persisted.
 */
export async function getGeo(h: Headers, ip: string): Promise<Geo> {
  const country = h.get("x-vercel-ip-country");
  const city = h.get("x-vercel-ip-city");
  const lat = h.get("x-vercel-ip-latitude");
  const lon = h.get("x-vercel-ip-longitude");

  if (country || city) {
    return {
      country: country || null,
      // Vercel percent-encodes the city (e.g. "San%20Francisco").
      city: city ? safeDecode(city) : null,
      // Vercel sends these as strings ("37.7749"); they are absent on some plans.
      lat: num(lat),
      lon: num(lon),
    };
  }

  return getGeoData(ip);
}

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

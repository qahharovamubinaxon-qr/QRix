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

export type Geo = { country: string | null; city: string | null };

const EMPTY: Geo = { country: null, city: null };

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

  if (country || city) {
    return {
      country: country || null,
      // Vercel percent-encodes the city (e.g. "San%20Francisco").
      city: city ? safeDecode(city) : null,
    };
  }

  return getGeoData(ip);
}

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

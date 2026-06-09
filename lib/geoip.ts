import maxmind from "maxmind";
import path from "path";

let reader: any = null;

export async function getGeoData(ip: string) {
  try {
    if (!reader) {
      reader = await maxmind.open(
        path.join(
          process.cwd(),
          "geoip",
          "GeoLite2-City.mmdb"
        )
      );
    }

    const result = reader.get(ip);

    return {
      country:
        result?.country?.names?.en ||
        null,

      city:
        result?.city?.names?.en ||
        null,
    };
  } catch (error) {
    console.error(
      "GeoIP Error:",
      error
    );

    return {
      country: null,
      city: null,
    };
  }
}
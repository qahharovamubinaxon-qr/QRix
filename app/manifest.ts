import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b12",
    theme_color: "#ff6a13",
    categories: ["productivity", "utilities"],
    /* .png, not the bare route names. The icons are static files
       (app/icon.png, app/apple-icon.png), so Next serves them at /icon.png and
       /apple-icon.png — /icon and /apple-icon are 404s, which is what the
       manifest asked for, so the installed app had no icon at all. Caught as a
       console error in a Lighthouse run on /qr-tools/url. */
    icons: [
      { src: "/icon.png", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

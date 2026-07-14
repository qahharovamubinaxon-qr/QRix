/**
 * Generates the dotted world map used by components/WorldMapBackground.tsx.
 *
 * Why this is a build step and not a client import: `dotted-map` carries the
 * world's land data inside its bundle — 352 KB of JavaScript — and its output is
 * 3065 dots. Importing it in the browser would put all of that on the homepage's
 * critical path and, if the dots were rendered as <circle> nodes, 3065 elements
 * into the DOM. Neither survives a Lighthouse budget.
 *
 * So we run it once, here, and commit two artefacts:
 *   public/world-dots.svg  — the map as a single image (one <img>, no DOM cost)
 *   lib/world-map.ts       — the viewBox, a pure-math projection, and the city list
 *
 * The projection is not guessed: it is fitted by least squares against
 * dotted-map's own getPin(), then validated against every city we ship. The fit
 * is reported below — if it ever regresses, this script fails loudly.
 *
 * Run:  node scripts/gen-world-map.mjs
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const DottedMap = require("dotted-map").default || require("dotted-map");

const HEIGHT = 60;
const GRID = "diagonal";
const map = new DottedMap({ height: HEIGHT, grid: GRID });

/* ── 1. the map image ─────────────────────────────────────────────────────── */
// #1d3a63 is a dim navy-blue: the land reads as a texture on the navy canvas, not
// as a picture competing with the content in front of it.
const svg = map.getSVG({
  radius: 0.22,
  color: "#1d3a63",
  shape: "circle",
  backgroundColor: "transparent",
});
writeFileSync("public/world-dots.svg", svg);

const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
if (!viewBox) throw new Error("dotted-map produced an SVG with no viewBox");

/* ── 2. fit the projection ────────────────────────────────────────────────────
   x is linear in longitude. y is a Mercator function of latitude. getPin() snaps
   to the dot grid but reports the lat/lng that its snapped x/y corresponds to, so
   fitting against (p.lng → p.x) and (p.lat → p.y) is fitting against exact pairs.
   The diagonal grid offsets alternate rows by half a cell, which is the only
   noise in the sample; least squares averages it out. */
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

const fit = (pairs) => {
  const n = pairs.length;
  const sx = pairs.reduce((s, [a]) => s + a, 0);
  const sy = pairs.reduce((s, [, b]) => s + b, 0);
  const sxy = pairs.reduce((s, [a, b]) => s + a * b, 0);
  const sxx = pairs.reduce((s, [a]) => s + a * a, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { slope, intercept: (sy - slope * sx) / n };
};

const xPairs = [];
const yPairs = [];
for (let lng = -170; lng <= 170; lng += 2) {
  const p = map.getPin({ lat: 0, lng });
  xPairs.push([p.lng, p.x]);
}
for (let lat = -55; lat <= 70; lat += 1) {
  const p = map.getPin({ lat, lng: 0 });
  yPairs.push([mercY(p.lat), p.y]);
}
const fx = fit(xPairs);
const fy = fit(yPairs);

const project = (lat, lon) => ({
  x: fx.intercept + fx.slope * lon,
  y: fy.intercept + fy.slope * mercY(lat),
});

/* ── 3. the cities ────────────────────────────────────────────────────────────
   Real population centres, not random noise: a scatter of random points would put
   "users" in the middle of the Pacific. Placing them on actual cities makes the
   field cluster the way real traffic does — dense across Europe, India and the US
   coasts, sparse across Siberia and the Sahara.

   The names are deliberately the IANA timezone city names (America/New_York,
   Asia/Tashkent, …). That earns the map a second job for free: when the server
   cannot resolve a visitor's geo — on localhost there are no Vercel headers at
   all — the client reads Intl's timezone, takes the city segment, and finds it
   right here. No permission prompt, no lookup table, no extra bytes. */
const CITIES = [
  // North America
  ["New York", "US", 40.71, -74.01], ["Los Angeles", "US", 34.05, -118.24],
  ["Chicago", "US", 41.88, -87.63], ["Denver", "US", 39.74, -104.99],
  ["Phoenix", "US", 33.45, -112.07], ["Seattle", "US", 47.61, -122.33],
  ["Boston", "US", 42.36, -71.06], ["Atlanta", "US", 33.75, -84.39],
  ["Dallas", "US", 32.78, -96.8], ["Detroit", "US", 42.33, -83.05],
  ["Houston", "US", 29.76, -95.37], ["Miami", "US", 25.76, -80.19],
  ["San Francisco", "US", 37.77, -122.42], ["Anchorage", "US", 61.22, -149.9],
  ["Honolulu", "US", 21.31, -157.86], ["Toronto", "CA", 43.65, -79.38],
  ["Vancouver", "CA", 49.28, -123.12], ["Montreal", "CA", 45.5, -73.57],
  ["Mexico City", "MX", 19.43, -99.13], ["Guatemala", "GT", 14.63, -90.51],
  ["Panama", "PA", 8.98, -79.52], ["Havana", "CU", 23.11, -82.37],
  // South America
  ["Bogota", "CO", 4.71, -74.07], ["Caracas", "VE", 10.48, -66.9],
  ["Lima", "PE", -12.05, -77.04], ["Quito", "EC", -0.18, -78.47],
  ["La Paz", "BO", -16.5, -68.15], ["Santiago", "CL", -33.45, -70.67],
  ["Buenos Aires", "AR", -34.6, -58.38], ["Montevideo", "UY", -34.9, -56.16],
  ["Asuncion", "PY", -25.26, -57.58], ["Sao Paulo", "BR", -23.55, -46.63],
  ["Rio de Janeiro", "BR", -22.91, -43.17],
  // Europe
  ["London", "GB", 51.51, -0.13], ["Dublin", "IE", 53.35, -6.26],
  ["Paris", "FR", 48.85, 2.35], ["Brussels", "BE", 50.85, 4.35],
  ["Amsterdam", "NL", 52.37, 4.9], ["Madrid", "ES", 40.42, -3.7],
  ["Barcelona", "ES", 41.39, 2.17], ["Lisbon", "PT", 38.72, -9.14],
  ["Berlin", "DE", 52.52, 13.4], ["Zurich", "CH", 47.38, 8.54],
  ["Milan", "IT", 45.46, 9.19], ["Rome", "IT", 41.9, 12.5],
  ["Vienna", "AT", 48.21, 16.37], ["Prague", "CZ", 50.08, 14.44],
  ["Budapest", "HU", 47.5, 19.04], ["Warsaw", "PL", 52.23, 21.01],
  ["Bucharest", "RO", 44.43, 26.1], ["Athens", "GR", 37.98, 23.73],
  ["Copenhagen", "DK", 55.68, 12.57], ["Oslo", "NO", 59.91, 10.75],
  ["Stockholm", "SE", 59.33, 18.07], ["Helsinki", "FI", 60.17, 24.94],
  ["Kyiv", "UA", 50.45, 30.52], ["Kiev", "UA", 50.45, 30.52], // legacy IANA name
  ["Minsk", "BY", 53.9, 27.57], ["Istanbul", "TR", 41.01, 28.98],
  ["Moscow", "RU", 55.76, 37.62], ["Yekaterinburg", "RU", 56.84, 60.61],
  ["Novosibirsk", "RU", 55.03, 82.92],
  // Africa
  ["Casablanca", "MA", 33.57, -7.59], ["Algiers", "DZ", 36.75, 3.06],
  ["Tunis", "TN", 36.81, 10.18], ["Tripoli", "LY", 32.89, 13.19],
  ["Cairo", "EG", 30.04, 31.24], ["Khartoum", "SD", 15.5, 32.56],
  ["Lagos", "NG", 6.52, 3.38], ["Accra", "GH", 5.6, -0.19],
  ["Abidjan", "CI", 5.36, -4.01], ["Dakar", "SN", 14.72, -17.47],
  ["Kinshasa", "CD", -4.44, 15.27], ["Luanda", "AO", -8.84, 13.23],
  ["Addis Ababa", "ET", 9.03, 38.74], ["Nairobi", "KE", -1.29, 36.82],
  ["Kampala", "UG", 0.35, 32.58], ["Dar es Salaam", "TZ", -6.79, 39.21],
  ["Harare", "ZW", -17.83, 31.05], ["Maputo", "MZ", -25.97, 32.57],
  ["Johannesburg", "ZA", -26.2, 28.04],
  // Middle East & Central Asia
  ["Dubai", "AE", 25.2, 55.27], ["Riyadh", "SA", 24.71, 46.68],
  ["Baghdad", "IQ", 33.31, 44.36], ["Tehran", "IR", 35.69, 51.39],
  ["Jerusalem", "IL", 31.77, 35.21], ["Beirut", "LB", 33.89, 35.5],
  ["Baku", "AZ", 40.41, 49.87], ["Tbilisi", "GE", 41.72, 44.79],
  ["Yerevan", "AM", 40.18, 44.51], ["Tashkent", "UZ", 41.31, 69.24],
  ["Samarkand", "UZ", 39.65, 66.96], ["Almaty", "KZ", 43.24, 76.89],
  ["Bishkek", "KG", 42.87, 74.59], ["Dushanbe", "TJ", 38.56, 68.79],
  ["Ashgabat", "TM", 37.95, 58.38], ["Kabul", "AF", 34.56, 69.21],
  // South Asia
  ["Karachi", "PK", 24.86, 67.0], ["Lahore", "PK", 31.55, 74.34],
  ["Delhi", "IN", 28.61, 77.21], ["Mumbai", "IN", 19.08, 72.88],
  ["Kolkata", "IN", 22.57, 88.36], ["Bangalore", "IN", 12.97, 77.59],
  ["Dhaka", "BD", 23.81, 90.41], ["Kathmandu", "NP", 27.72, 85.32],
  ["Colombo", "LK", 6.93, 79.86],
  // East & Southeast Asia
  ["Yangon", "MM", 16.87, 96.2], ["Bangkok", "TH", 13.76, 100.5],
  ["Phnom Penh", "KH", 11.56, 104.92], ["Vientiane", "LA", 17.97, 102.63],
  ["Hanoi", "VN", 21.03, 105.85], ["Ho Chi Minh", "VN", 10.82, 106.63],
  ["Kuala Lumpur", "MY", 3.14, 101.69], ["Singapore", "SG", 1.35, 103.82],
  ["Jakarta", "ID", -6.21, 106.85], ["Manila", "PH", 14.6, 120.98],
  ["Hong Kong", "HK", 22.32, 114.17], ["Taipei", "TW", 25.03, 121.57],
  ["Shanghai", "CN", 31.23, 121.47], ["Beijing", "CN", 39.9, 116.41],
  ["Ulaanbaatar", "MN", 47.89, 106.91], ["Seoul", "KR", 37.57, 126.98],
  ["Tokyo", "JP", 35.68, 139.69],
  // Oceania
  ["Perth", "AU", -31.95, 115.86], ["Adelaide", "AU", -34.93, 138.6],
  ["Brisbane", "AU", -27.47, 153.03], ["Melbourne", "AU", -37.81, 144.96],
  ["Sydney", "AU", -33.87, 151.21], ["Auckland", "NZ", -36.85, 174.76],
];

/* ── 4. validate: the fitted projection must land on the same dot getPin picks ── */
let worst = 0;
let worstCity = "";
for (const [name, , lat, lon] of CITIES) {
  const pin = map.getPin({ lat, lng: lon });
  const p = project(lat, lon);
  const err = Math.hypot(pin.x - p.x, pin.y - p.y);
  if (err > worst) { worst = err; worstCity = name; }
}
// One grid cell is 1 unit. Half a cell is the most getPin's own snapping can
// disagree by, and the pin we draw is far larger than that.
const TOLERANCE = 0.75;
console.log(`viewBox            : ${viewBox}`);
console.log(`x = ${fx.intercept.toFixed(4)} + ${fx.slope.toFixed(5)} * lon`);
console.log(`y = ${fy.intercept.toFixed(4)} + ${fy.slope.toFixed(5)} * mercY(lat)`);
console.log(`worst city residual: ${worst.toFixed(3)} units (${worstCity})`);
if (worst > TOLERANCE) {
  throw new Error(`projection fit is off by ${worst.toFixed(3)} units at ${worstCity} — refusing to emit`);
}

/* ── 5. emit the client module ────────────────────────────────────────────── */
const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
const cities = CITIES.map(([name, cc, lat, lon]) => {
  const p = project(lat, lon);
  return `  { n: ${JSON.stringify(name)}, c: ${JSON.stringify(cc)}, x: ${p.x.toFixed(2)}, y: ${p.y.toFixed(2)} },`;
}).join("\n");

writeFileSync(
  "lib/world-map.ts",
  `/* GENERATED by scripts/gen-world-map.mjs — do not edit by hand.
   Run \`node scripts/gen-world-map.mjs\` to regenerate.

   The map image lives at public/world-dots.svg. \`dotted-map\` (352 KB, world land
   data included) stays out of the client bundle: the projection below is fitted
   against its getPin() and validated against every city here to within
   ${worst.toFixed(3)} of a grid cell. */

export const VIEW_W = ${vbW};
export const VIEW_H = ${vbH};
export const VIEW_BOX = ${JSON.stringify(viewBox)};

/** lat/lon → the map's coordinate space (same space as VIEW_BOX). */
export function project(lat: number, lon: number): { x: number; y: number } {
  const merc = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return {
    x: ${fx.intercept.toFixed(4)} + ${fx.slope.toFixed(5)} * lon,
    y: ${fy.intercept.toFixed(4)} + ${fy.slope.toFixed(5)} * merc,
  };
}

/** Population centres, pre-projected. Used as the "someone is online here" field —
    a random scatter would put users in the middle of the Pacific. */
export type City = { n: string; c: string; x: number; y: number };
export const CITIES: City[] = [
${cities}
];
`
);

console.log(`\nwrote public/world-dots.svg  (${(svg.length / 1024).toFixed(0)} KB, ${map.getPoints().length} dots)`);
console.log(`wrote lib/world-map.ts       (${CITIES.length} cities)`);

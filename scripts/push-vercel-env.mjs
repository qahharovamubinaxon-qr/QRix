// Push the local AI/secret env vars to Vercel in one command, at deploy time.
// The keys live only in .env.local (gitignored) — Vercel never receives them
// automatically — so run this once after `vercel login` && `vercel link`.
//
//   node scripts/push-vercel-env.mjs
//
// It reads each key's value from .env.local and adds it to Production + Preview.
// No secrets are stored in this file. Safe to commit.

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Add any env var here that must exist on the host but lives only in .env.local.
const KEYS = [
  "CEREBRAS_API_KEY",
  "CLOUDFLARE_API_KEY",
  "CLOUDFLARE_ACCOUNT_ID",
  // When you set these up, uncomment to push them too:
  // "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "DATABASE_URL",
  // "NEXT_PUBLIC_ADSENSE_CLIENT", "NEXT_PUBLIC_GA_ID", "NEXT_PUBLIC_SENTRY_DSN",
];

let raw;
try {
  raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
} catch {
  console.error("✗ .env.local not found next to the project root. Nothing to push.");
  process.exit(1);
}

const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}

let ok = 0, skipped = 0, failed = 0;
for (const key of KEYS) {
  const value = env[key];
  if (!value) { console.log(`• skip ${key} (not in .env.local)`); skipped++; continue; }
  for (const target of ["production", "preview"]) {
    try {
      // `vercel env add NAME target` reads the value from stdin.
      execSync(`vercel env add ${key} ${target}`, { input: value + "\n", stdio: ["pipe", "inherit", "inherit"] });
      console.log(`✓ ${key} → ${target}`);
      ok++;
    } catch {
      console.log(`✗ ${key} → ${target}  (already set, or run \`vercel login\` && \`vercel link\` first)`);
      failed++;
    }
  }
}
console.log(`\nDone. added=${ok} skipped=${skipped} failed=${failed}`);

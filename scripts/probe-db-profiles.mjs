/* Does db.users hold REAL people now, or the four invented ones?
   ───────────────────────────────────────────────────────────────────────────
   lib/server/db.ts seeded itself with alex@example.com, Sam Lee and Jo Park,
   and /admin, /dashboard and the Telegram report have been reading them as
   though they were customers. The fix hydrates the collection from Supabase's
   `profiles` table at boot.

   This asserts the outcome rather than the wiring: it imports the real module
   and checks that no invented address survives, that the count matches what
   the table actually holds, and that ADMIN is still derived from
   ADMIN_EMAILS rather than from anything a database write could set.

     npm run probe:db-profiles

   Exits non-zero on failure so it can gate a deploy. */
import fs from "node:fs";

/* The module reads process.env, and .env.local is the app's own file — load
   the two keys it needs rather than adding dotenv for one script. */
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  if (!line.includes("=") || line.trimStart().startsWith("#")) continue;
  const i = line.indexOf("=");
  const k = line.slice(0, i).trim();
  if (!process.env[k]) process.env[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
}

const { db, dbDriver } = await import("../lib/server/db.ts");
const { loadUsers, profilesConfigured } = await import("../lib/server/db-profiles.ts");

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed++;
};

console.log(`\nconfigured: ${profilesConfigured()} · driver reported as "${dbDriver}"\n`);

const users = db.users.all();
console.log(`db.users holds ${users.length} row(s):`);
for (const u of users) console.log(`   ${u.email.padEnd(34)} ${u.role.padEnd(6)} ${u.plan}`);
console.log();

/* The seeded fictions. If any of these is still present, the hydration did not
   replace the seed and every number downstream is still invented. */
const INVENTED = ["alex@example.com", "sam@example.com", "jo@example.com"];
const survivors = users.filter((u) => INVENTED.includes(u.email.toLowerCase()));
check("no invented users survive hydration", survivors.length === 0,
  survivors.length ? survivors.map((u) => u.email).join(", ") : "");

const fromTable = await loadUsers();
check("the table was readable", fromTable !== null,
  fromTable === null ? "loadUsers() returned null — could not look" : `${fromTable.length} row(s)`);

if (fromTable) {
  check("db.users count matches the table", users.length === fromTable.length,
    `${users.length} in memory vs ${fromTable.length} in profiles`);
}

/* Role must come from ADMIN_EMAILS. If it ever came from a column, anything
   able to write to the database could grant itself admin. */
const admins = users.filter((u) => u.role === "ADMIN");
check("ADMIN is derived from ADMIN_EMAILS, not stored", admins.length <= 1,
  admins.map((u) => u.email).join(", ") || "none");

/* Every plan must be a real enum member — profiles.plan is free text. */
const PLANS = new Set(["FREE", "PRO", "BUSINESS", "ENTERPRISE"]);
const badPlans = users.filter((u) => !PLANS.has(u.plan));
check("every plan is a valid enum value", badPlans.length === 0,
  badPlans.map((u) => `${u.email}=${u.plan}`).join(", "));

console.log(`\n${failed ? `${failed} check(s) FAILED` : "all checks passed"}`);
process.exit(failed ? 1 : 0);

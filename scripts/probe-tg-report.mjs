/* Does the Telegram report's Uzbek traffic block actually work?
   ───────────────────────────────────────────────────────────────────────────
   The block runs on Vercel, where it reads GSC_SERVICE_ACCOUNT_JSON. That
   variable cannot be set right now — the owner is locked out of the Vercel
   dashboard by a lost 2FA method — so the code would otherwise ship untested
   and light up unattended weeks later, which is how a report full of zeros
   gets believed in the first place.

   This runs the REAL lib/server/analytics-ga.ts against the REAL property, by
   loading the key from ~/.qrix/gsc.json into the same variable the server
   reads. Nothing is sent to Telegram: api.telegram.org is blocked from this
   network, and the point here is the text, not the delivery.

     npm run probe:tg-report            yesterday
     npm run probe:tg-report -- 7       any window */
import { loadKey } from "./gsc-auth.mjs";

/* The server reads the key from the environment; the scripts read it from
   disk. Bridge them so what runs here is exactly what will run there. */
process.env.GSC_SERVICE_ACCOUNT_JSON ||= JSON.stringify(loadKey());

const { uzbekTrafficBlock, gaSnapshot, gaConfigured } = await import("../lib/server/analytics-ga.ts");

const days = Number(process.argv[2]) || 1;

console.log(`gaConfigured: ${gaConfigured()}`);

const snap = await gaSnapshot(days);
if (!snap) {
  console.log("\ngaSnapshot returned null — the report would say 'cannot see', not 'nobody came'.");
  console.log(await uzbekTrafficBlock(days));
  process.exit(1);
}

console.log(`snapshot: ${snap.from}…${snap.to} — ${snap.users} users (was ${snap.prevUsers}), ${snap.tools.length} named tool(s)\n`);
console.log("─".repeat(60));
console.log(await uzbekTrafficBlock(days).then((t) => t.replace(/<[^>]+>/g, "")));
console.log("─".repeat(60));

/* An empty section is a real possibility on a quiet day and must still read as
   a sentence rather than a dangling heading. */
const text = await uzbekTrafficBlock(days);
for (const heading of ["Нима ишлатишди", "Қаердан келишди", "Нима очишди", "Мамлакатлар"]) {
  const i = text.indexOf(heading);
  if (i < 0) { console.log(`MISSING SECTION: ${heading}`); process.exit(1); }
  const after = text.slice(i, i + 400);
  if (!/•/.test(after)) { console.log(`EMPTY SECTION with no fallback line: ${heading}`); process.exit(1); }
}
console.log("every section rendered with content or an explicit fallback line");

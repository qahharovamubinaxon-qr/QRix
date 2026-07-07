// QRix database seed — run after `prisma migrate deploy`:  npm run db:seed
// Provisions the admin account and default feature flags. Idempotent.
const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const ADMIN = (process.env.ADMIN_EMAILS || "musarasulzada@gmail.com").split(",")[0].trim();

await prisma.user.upsert({
  where: { email: ADMIN },
  update: { role: "ADMIN" },
  create: { email: ADMIN, name: "Admin", role: "ADMIN", plan: "ENTERPRISE", emailVerified: new Date() },
});

for (const [key, enabled] of [["api-keys", true], ["referrals", true], ["cloud-ai", false], ["video-export", false]]) {
  await prisma.featureFlag.upsert({ where: { key }, update: {}, create: { key, enabled, rollout: enabled ? 100 : 0 } });
}

console.log(`Seeded admin ${ADMIN} + feature flags.`);
await prisma.$disconnect();

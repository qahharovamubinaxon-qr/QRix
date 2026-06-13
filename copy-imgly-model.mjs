// QRix — IMG.LY моделини public папкага кўчириш
// Ишлатиш: node copy-imgly-model.mjs
import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from "fs";
import { join } from "path";

const src = "node_modules/@imgly/background-removal-data/dist";
const dest = "public/imgly";

if (!existsSync(src)) {
  console.error("❌ node_modules/@imgly/background-removal-data topilmadi.");
  console.error("   Avval: npm install @imgly/background-removal-data@1.4.5");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

// Hajmni hisoblash
let total = 0, count = 0;
for (const f of readdirSync(dest)) {
  total += statSync(join(dest, f)).size;
  count++;
}
console.log(`✅ Tayyor! ${count} ta fayl (${(total / 1048576).toFixed(0)} MB) → public/imgly/`);
console.log("   Endi RemoveBgClient publicPath: '/imgly/' dan foydalanadi.");

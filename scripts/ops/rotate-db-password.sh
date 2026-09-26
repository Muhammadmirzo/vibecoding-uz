#!/usr/bin/env bash
# Rotate the Supabase DB password everywhere after resetting it in the Supabase dashboard.
# Usage (owner, in a normal terminal): bash scripts/ops/rotate-db-password.sh
# The new password is read hidden from the keyboard; it never goes to argv, logs or chat.
set -euo pipefail
cd "$(dirname "$0")/../.."

read -rsp "Supabase'dagi YANGI DB parolini joylang (ekranda ko'rinmaydi), Enter: " NEWPW; echo
[ -n "$NEWPW" ] || { echo "Parol bo'sh. To'xtadim."; exit 1; }
export NEWPW

# Build the new URL from the current one (same host/user/port/db), only the password changes.
NEWURL=$(node -e '
  const fs = require("fs");
  const m = fs.readFileSync(".env", "utf8").match(/^DATABASE_URL=["]?([^"\n]+)/m);
  if (!m) { console.error(".env da DATABASE_URL topilmadi"); process.exit(1); }
  const u = new URL(m[1]); u.password = encodeURIComponent(process.env.NEWPW);
  process.stdout.write(u.toString());')
export NEWURL

echo "1/4 Yangi parol bilan ulanishni tekshiryapman..."
node --input-type=module -e '
  import postgres from "postgres";
  const sql = postgres(process.env.NEWURL, { prepare: false, max: 1, connect_timeout: 15 });
  const [r] = await sql`select 1 as ok`; await sql.end();
  if (r.ok !== 1) process.exit(1);' \
  || { echo "Ulanib bo'lmadi: parol noto'g'ri yoki Supabase hali yangilanmagan. Hech narsa o'zgartirilmadi."; exit 1; }
echo "   OK"

echo "2/4 Vercel DATABASE_URL (production, preview, development) yangilanmoqda..."
printf %s "$NEWURL" | vercel env add DATABASE_URL production --force --sensitive --yes >/dev/null
printf %s "$NEWURL" | vercel env add DATABASE_URL preview --force --sensitive --yes >/dev/null
printf %s "$NEWURL" | vercel env add DATABASE_URL development --force --yes >/dev/null
echo "   OK"

echo "3/4 Lokal .env fayllar yangilanmoqda (asosiy repo + worktree'lar)..."
node -e '
  const fs = require("fs"), path = require("path");
  const files = [".env", ...(fs.existsSync("../vibecoding-uz-wt") ? fs.readdirSync("../vibecoding-uz-wt").map((d) => path.join("../vibecoding-uz-wt", d, ".env")) : [])];
  let n = 0;
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, "utf8");
    const t = s.replace(/^DATABASE_URL=.*$/m, "DATABASE_URL=\"" + process.env.NEWURL + "\"");
    if (t !== s) { fs.writeFileSync(f, t, { mode: 0o600 }); n++; }
  }
  console.log("   " + n + " ta fayl yangilandi");'

echo "4/4 Production qayta deploy qilinmoqda (2-3 daqiqa)..."
vercel redeploy https://master-2-jade.vercel.app --target production >/dev/null
code=$(curl -s -o /dev/null -w "%{http_code}" -H "cookie: session_token=rotation-smoke-test" https://master-2-jade.vercel.app/api/v1/me)
home=$(curl -s -o /dev/null -w "%{http_code}" https://master-2-jade.vercel.app/)
echo "   Sayt: $home (200 kutiladi), login tekshiruvi: $code (401 kutiladi)"
if [ "$home" = "200" ] && [ "$code" = "401" ]; then echo "TAYYOR: eski parol endi hech narsaga yaramaydi."; else echo "DIQQAT: natija kutilganday emas. Claude'ga shu qatorni yuboring."; fi

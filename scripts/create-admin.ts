/**
 * scripts/create-admin.ts
 * Superadmin hisob yaratish / yangilash (bir martalik provision).
 * Hech qanday parol kodda saqlanmaydi — ADMIN_PASSWORD env orqali uzatiladi.
 *
 * Ishlatish:
 *   set -a; source .env; set +a
 *   ADMIN_PHONE="+998901234567" ADMIN_EMAIL="admin@mirzo.uz" ADMIN_PASSWORD="..." npx tsx scripts/create-admin.ts
 *   # yoki generatsiya: ADMIN_PHONE=... ADMIN_EMAIL=... npx tsx scripts/create-admin.ts --generate
 */
import crypto from "crypto";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { hashPassword, normalizePhone } from "../src/lib/auth/password";
import { or, eq } from "drizzle-orm";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main(): Promise<void> {
  const rawPhone = process.env.ADMIN_PHONE || getArg("--phone");
  const email = (process.env.ADMIN_EMAIL || getArg("--email") || "").toLowerCase().trim();
  let password = process.env.ADMIN_PASSWORD || getArg("--password") || "";

  if (!rawPhone || !email) {
    console.error("Xato: ADMIN_PHONE va ADMIN_EMAIL shart (env yoki --phone/--email).");
    process.exit(1);
  }

  let generated = false;
  if (!password || getArg("--generate")) {
    password = crypto.randomBytes(12).toString("base64url");
    generated = true;
  }
  if (password.length < 12) {
    console.error("Xato: parol kamida 12 belgidan iborat bo'lishi kerak.");
    process.exit(1);
  }

  const phone = normalizePhone(rawPhone);
  const passwordHash = await hashPassword(password);

  const existing = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, phone), eq(users.email, email)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({ phone, email, fullName: "Super Admin", role: "superadmin", passwordHash })
      .where(eq(users.id, existing[0].id));
    console.log(`Yangilandi: ${email} / ${phone} (superadmin)`);
  } else {
    await db
      .insert(users)
      .values({ phone, email, fullName: "Super Admin", role: "superadmin", passwordHash })
      .returning();
    console.log(`Yaratildi: ${email} / ${phone} (superadmin)`);
  }

  if (generated) {
    console.log("PAROL (bir marta ko'rsatiladi, kirgach o'zgartiring): " + password);
  } else {
    console.log("Parol o'rnatildi (kiritilgan qiymat).");
  }
}

main().catch((err) => {
  console.error("create-admin xatosi:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});

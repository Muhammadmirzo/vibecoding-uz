import { ne } from "drizzle-orm";
import { db } from "../../src/db";
import { portfolios } from "../../src/db/schema";

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await db.select({ id: portfolios.id, slug: portfolios.slug, title: portfolios.title, ownership: portfolios.ownership, status: portfolios.status })
    .from(portfolios)
    .where(ne(portfolios.slug, "clash-nexus"));

  console.log(`${apply ? "APPLY" : "DRY-RUN"}: ${rows.length} ta Clash Nexus'dan tashqari portfolio yozuvi topildi.`);
  for (const row of rows) console.log(`- ${row.slug} — ${row.title} (${row.ownership}/${row.status})`);

  if (!apply) {
    console.log("Hech narsa yozilmadi. Ogohlantirish: --apply faqat owner tasdig'idan keyin ishga tushiriladi.");
    return;
  }

  if (rows.length === 0) return;
  await db.update(portfolios).set({ ownership: "demo", status: "hidden", isFeatured: false, featuredRank: null })
    .where(ne(portfolios.slug, "clash-nexus"));
  console.log(`${rows.length} ta yozuv demo + hidden holatga o'tkazildi.`);
}

main().then(() => process.exit(0)).catch((error: unknown) => {
  console.error("Portfolio tozalash yakunlanmadi:", error);
  process.exit(1);
});

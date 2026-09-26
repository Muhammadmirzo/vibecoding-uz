import postgres from "postgres";

const url = process.argv[2];
const sql = postgres(url, { connect_timeout: 15, max: 1 });

async function main() {
  try {
    const r = await sql`select current_database() as db`;
    console.log("ULANDI: db=" + r[0].db);

    const t = await sql`
      select count(*)::int as n
      from information_schema.tables
      where table_schema = 'public'
    `;
    console.log("jadvallar: " + t[0].n);

    const l = await sql`
      select column_name, is_nullable
      from information_schema.columns
      where table_name = 'leads' and column_name in ('phone','telegram')
      order by column_name
    `;
    console.log("leads ustunlari: " + JSON.stringify(l));
  } catch (e) {
    console.log("XATO: " + String(e).slice(0, 150));
  } finally {
    await sql.end({ timeout: 1 });
  }
}

void main();

const { Client } = require('pg');

async function testConnection(name, connectionString) {
  console.log(`\nTesting connection [${name}]...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    const res = await client.query('SELECT NOW() as now, version() as version;');
    console.log(`[SUCCESS] Connected to ${name}:`, res.rows[0]);
    await client.end();
    return true;
  } catch (err) {
    console.error(`[ERROR] Failed to connect to ${name}:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function run() {
  const pass = 'AcademyMirzo2026SecureDBPass!';
  const ref = 'gvfzomtdswzlxstjvwiv';

  const urls = [
    { name: 'Direct SSL', url: `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres` },
    { name: 'Pooler 6543 (Transaction)', url: `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres` },
    { name: 'Pooler 5432 (Session)', url: `postgresql://postgres.${ref}:${pass}@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres` }
  ];

  for (const item of urls) {
    await testConnection(item.name, item.url);
  }
}

run();

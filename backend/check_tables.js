const { Client } = require('pg');

const client = new Client({
  user: 'neondb_owner',
  password: 'npg_wR9iIDYGj2ga',
  host: 'ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech',
  database: 'tenderease_user_db',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkTables();

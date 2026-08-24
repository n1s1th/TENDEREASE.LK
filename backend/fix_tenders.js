const { Client } = require('pg');

const client = new Client({
  user: 'neondb_owner',
  password: 'npg_wR9iIDYGj2ga',
  host: 'ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech',
  database: 'tenderease_tender_db',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixAwardedTenders() {
  try {
    await client.connect();
    
    // Update all AWARDED tenders to have tenderease51@gmail.com
    const query = `
      UPDATE tender 
      SET dynamic_data = COALESCE(dynamic_data, '{}'::jsonb) || '{"awardedByEmail": "tenderease51@gmail.com"}'::jsonb 
      WHERE status = 'AWARDED'
      RETURNING id, tender_number, dynamic_data;
    `;
    
    const res = await client.query(query);
    console.log(`Updated ${res.rowCount} awarded tenders to use tenderease51@gmail.com.`);
    if (res.rowCount > 0) {
      console.log(res.rows);
    }
    
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

fixAwardedTenders();

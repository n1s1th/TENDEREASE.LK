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

async function updateTender() {
  try {
    await client.connect();
    console.log("Connected to the database");
    
    const tenderNo = 'TR-2026-001446';
    
    // Update tender status back to CLOSED
    const updateQuery = `
      UPDATE tender 
      SET status = 'CLOSED', dynamic_data = '{}'::jsonb 
      WHERE tender_number = $1
      RETURNING id, tender_number, status, dynamic_data;
    `;
    
    const res = await client.query(updateQuery, [tenderNo]);
    console.log("Updated Tender:", res.rows[0]);
    
  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

updateTender();

const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_wR9iIDYGj2ga@ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech/tenderease_bid_db?sslmode=require'
});

async function run() {
  await client.connect();
  const tenderId = '1e0e08b4-b263-4e53-ba1c-98c425e51c1e';
  
  const bids = [
    {
      id: crypto.randomUUID(),
      tender_id: tenderId,
      bidder_name: 'Tamasha Sirisooriya',
      bidder_email: 'tamashasirisooriya@gmail.com',
      company_name: 'DURGA INFRA (PRIVATE) LIMITED',
      bid_amount: 15000,
      currency: 'LKR',
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bid_data: JSON.stringify({})
    },
    {
      id: crypto.randomUUID(),
      tender_id: tenderId,
      bidder_name: 'Samadith Methnuk',
      bidder_email: 'samadithmethnuk1@gmail.com',
      company_name: 'Samadith Traders',
      bid_amount: 14500,
      currency: 'LKR',
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bid_data: JSON.stringify({})
    }
  ];

  for (const bid of bids) {
    await client.query(
      'INSERT INTO bid (id, tender_id, bidder_name, bidder_email, company_name, bid_amount, currency, status, submitted_at, created_at, updated_at, bid_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [bid.id, bid.tender_id, bid.bidder_name, bid.bidder_email, bid.company_name, bid.bid_amount, bid.currency, bid.status, bid.submitted_at, bid.created_at, bid.updated_at, bid.bid_data]
    );
    console.log('Inserted bid for', bid.bidder_email);
  }

  await client.end();
}

run().catch(console.error);
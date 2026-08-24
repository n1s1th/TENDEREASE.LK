const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_wR9iIDYGj2ga@ep-nameless-haze-ao5zyycp-pooler.c-2.ap-southeast-1.aws.neon.tech/tenderease_evaluation_db?sslmode=require' });
async function run() {
  await client.connect();
  await client.query(`INSERT INTO recommendation_notes (tender_id, tender_name, department, estimated_budget, bidder_name, recommended_value, final_score, justification, status, created_at, updated_at) VALUES ('e9c22be9-eb37-4cd1-b0df-5338e5e8dcf4', 'Infrastructure Enhancement Procurement', 'IT & Software', 10000000.00, 'REMOSEY TRADE SOLUTIONS (PVT) LTD', 14500.00, 80.00, 'Recommended based on scoring criteria.', 'PENDING', NOW(), NOW())`);
  console.log('Created recommendation note');
  await client.end();
}
run().catch(console.error);

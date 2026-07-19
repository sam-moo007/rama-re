const { Client } = require('pg');
const { residence1204 } = require('@rama/contracts');

async function run() {
  const client = new Client({ connectionString: 'postgresql://rama:rama_local@localhost:5432/rama' });
  await client.connect();

  const payload = JSON.stringify(residence1204);
  const slug = residence1204.slug;

  try {
    // 1. Ensure a dummy record exists in catalogue to satisfy FK
    await client.query(`
      INSERT INTO property_catalogue_projection 
      (id, canonical_slug, record_kind, name, price_aed, tenure, evidence_coverage, published_at, decision_room_available, sponsored, community, freshness, media_representation, step_free_access) 
      VALUES 
      (gen_random_uuid(), $1, 'synthetic_demo', $2, 2500000, 'ready', 85, NOW(), true, false, '{"en": "Downtown Dubai"}', 'stale', 'exact_unit', 'unknown')
      ON CONFLICT (canonical_slug) DO NOTHING;
    `, [slug, JSON.stringify(residence1204.name)]);

    // 2. Insert into decision_room
    await client.query(`
      INSERT INTO property_decision_room_projection (canonical_slug, room_payload)
      VALUES ($1, $2)
      ON CONFLICT (canonical_slug) DO UPDATE SET room_payload = EXCLUDED.room_payload;
    `, [slug, payload]);

    console.log('Seed applied successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();

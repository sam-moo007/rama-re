import fs from "fs";
import path from "path";
import crypto from "crypto";

const API_URL = "http://127.0.0.1:4000/api/v1";

const HEADERS = {
  "Content-Type": "application/json",
  "x-rama-user": "e2e_tester",
  "x-rama-role": "evidence_lead",
};

async function main() {
  console.log("🚀 Starting E2E Ingestion Test...");

  // 1. Create a Source
  console.log("🛠️ Creating Ingestion Source...");
  const createSourceRes = await fetch(`${API_URL}/ingestion/sources`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      key: "test_partner",
      displayName: { en: "Test Partner", ar: "شريك الاختبار" },
      adapterKind: "partner_file",
      entitlementReference: "contract_e2e_123",
      allowedEvidenceClasses: ["registry_regulator", "on_site_observed", "document_verified"],
      reason: "E2E testing",
    }),
  });

  if (!createSourceRes.ok) {
    if (createSourceRes.status === 409) {
      console.log("⚠️ Source already exists, continuing...");
    } else {
      const text = await createSourceRes.text();
      console.error(`❌ Failed to create source: ${createSourceRes.status} ${text}`);
      process.exit(1);
    }
  } else {
    console.log("✅ Source created.");
  }

  // 2. Enable Source
  console.log("🛠️ Enabling Ingestion Source...");
  const enableSourceRes = await fetch(`${API_URL}/ingestion/sources/test_partner/enable`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      expectedVersion: 1,
      reason: "E2E testing enable",
    }),
  });
  
  // We can ignore 409 conflict or version mismatch if it's already enabled.
  console.log(`✅ Enable response: ${enableSourceRes.status}`);

  // 3. Read CSV and prepare payload
  const csvPath = path.join(__dirname, "mock-properties.csv");
  const csvBuffer = fs.readFileSync(csvPath);
  const contentBase64 = csvBuffer.toString("base64");
  const sha256 = crypto.createHash("sha256").update(csvBuffer).digest("hex");

  // 4. Upload Partner File
  console.log("📤 Uploading Partner File...");
  const uploadRes = await fetch(`${API_URL}/ingestion/partner-file`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      sourceKey: "test_partner",
      batchIdempotencyKey: `batch_${Date.now()}`,
      schemaVersion: "rama.partner.csv.v1",
      retrievedAt: new Date().toISOString(),
      artifact: {
        objectKey: `e2e/test_${Date.now()}.csv`,
        sha256: sha256,
        mimeType: "text/csv",
        byteSize: csvBuffer.length,
        capturedAt: new Date().toISOString(),
      },
      contentBase64,
    }),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    console.error(`❌ Failed to upload partner file: ${uploadRes.status} ${text}`);
    process.exit(1);
  }

  const result = await uploadRes.json();
  console.log(`✅ Partner File Uploaded Successfully!`);
  console.log(`   - Accepted Rows: ${result.counts?.accepted}`);
  console.log(`   - Resolution Items Generated: ${result.resolutionItems?.length}`);

  // 5. Fetch Resolution Queue
  console.log("📥 Fetching Resolution Queue...");
  const queueRes = await fetch(`${API_URL}/ingestion/resolution-queue`, {
    headers: HEADERS,
  });

  if (!queueRes.ok) {
    console.error(`❌ Failed to fetch queue: ${queueRes.status}`);
    process.exit(1);
  }

  const queue = await queueRes.json();
  console.log(`✅ Queue Fetched! Total Items: ${queue.items?.length}`);

  if (queue.items && queue.items.length > 0) {
    console.log("🔍 Checking first item in queue...");
    const firstItem = queue.items[0];
    
    // 6. Resolve Entity
    console.log(`🛠️ Resolving Item ${firstItem.id}...`);
    const resolveRes = await fetch(`${API_URL}/ingestion/resolution-queue/${firstItem.id}/resolve`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        expectedVersion: firstItem.version,
        decision: "rejected",
        canonicalPropertySlug: null,
        reason: "E2E automatic rejection",
      }),
    });

    if (!resolveRes.ok) {
      const text = await resolveRes.text();
      console.error(`❌ Failed to resolve entity: ${resolveRes.status} ${text}`);
      process.exit(1);
    }

    console.log(`✅ Entity Resolved Successfully!`);
  }
}

main().catch(console.error);

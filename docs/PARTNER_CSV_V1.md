# RAMA approved partner CSV v1

Schema identifier: `rama.partner.csv.v1`

The adapter accepts UTF-8 CSV with this exact header order:

```csv
external_id,property_slug,claim_key,evidence_class,retrieved_at,payload_json
```

Example:

```csv
EXT-001,residence-1204,advert_permit_broker,document_verified,2026-07-18T05:00:00.000Z,"{""permit"":""P-1""}"
```

Rules:

- `external_id` is unique within the file and contains only letters, digits, dot, underscore or hyphen.
- `property_slug` is a source hint. It does not become canonical until entity resolution matches it to an existing RAMA property.
- `evidence_class` must be in the source's approved allowlist.
- `retrieved_at` is an ISO 8601 timestamp.
- `payload_json` is a JSON object encoded as one CSV field.
- File bytes must match the declared byte count and SHA-256.
- Default limits are 5 MB, 1,000 rows and 256 KiB per row payload.
- A batch idempotency key can only identify one exact file.
- Exact file replays return the original rows. Conflicting extraction from the same artifact is quarantined.
- Batch bytes, raw rows, associations and initial resolution work commit atomically.
- After checksum validation, exact bytes are malware-scanned and written with conditional immutable creation before any row lands.
- Clean and malicious objects are separated into different storage buckets. A malware verdict returns HTTP 422 and creates no raw rows or resolution work.
- Reusing an object key for different bytes fails with `ARTIFACT_IMMUTABILITY_CONFLICT`; an exact object replay is recognized without overwrite.

The HTTP endpoint is `POST /api/v1/ingestion/partner-file`. During the current controlled phase, evidence analysts or evidence leads submit the base64-encoded file through the staff API. Direct partner-role access is denied until relationship-based identity and source binding are implemented.

Evidence leads can inspect storage driver, bucket, checksum, scan engine/verdict/signature, submitter and timestamps at `GET /api/v1/ingestion/artifacts`. The endpoint does not return the stored bytes.

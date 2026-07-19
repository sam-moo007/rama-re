CREATE TYPE entity_resolution_status AS ENUM ('pending', 'matched', 'conflict', 'rejected');
CREATE TYPE entity_resolution_action AS ENUM ('queued', 'matched', 'conflict_marked', 'rejected');

CREATE TABLE partner_ingestion_batches (
  id uuid PRIMARY KEY,
  source_id uuid NOT NULL REFERENCES ingestion_sources(id),
  batch_idempotency_key text NOT NULL,
  schema_version text NOT NULL,
  retrieved_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL,
  submitted_by text NOT NULL,
  artifact_object_key text NOT NULL,
  artifact_sha256 text NOT NULL CHECK (artifact_sha256 ~ '^[a-fA-F0-9]{64}$'),
  artifact_mime_type text NOT NULL,
  artifact_byte_size bigint NOT NULL CHECK (artifact_byte_size > 0),
  artifact_captured_at timestamptz,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  raw_content bytea NOT NULL,
  row_count integer NOT NULL CHECK (row_count BETWEEN 1 AND 1000),
  UNIQUE (source_id, batch_idempotency_key)
);

ALTER TABLE raw_ingestion_records
  ADD COLUMN external_entity_id text,
  ADD COLUMN partner_batch_id uuid REFERENCES partner_ingestion_batches(id);

CREATE TABLE partner_batch_records (
  batch_id uuid NOT NULL REFERENCES partner_ingestion_batches(id),
  row_index integer NOT NULL CHECK (row_index >= 0),
  raw_record_id uuid NOT NULL REFERENCES raw_ingestion_records(id),
  replayed boolean NOT NULL,
  PRIMARY KEY (batch_id, row_index)
);

CREATE TABLE entity_resolution_work_items (
  id uuid PRIMARY KEY,
  raw_record_id uuid UNIQUE NOT NULL REFERENCES raw_ingestion_records(id),
  external_entity_id text NOT NULL,
  submitted_property_slug text NOT NULL,
  status entity_resolution_status NOT NULL,
  canonical_property_slug text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  assigned_to text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (
    (status = 'matched' AND canonical_property_slug IS NOT NULL)
    OR
    (status <> 'matched' AND canonical_property_slug IS NULL)
  )
);

CREATE TABLE entity_resolution_events (
  id uuid PRIMARY KEY,
  work_item_id uuid NOT NULL REFERENCES entity_resolution_work_items(id),
  action entity_resolution_action NOT NULL,
  actor_id text NOT NULL,
  reason text NOT NULL,
  from_status entity_resolution_status,
  to_status entity_resolution_status NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL,
  UNIQUE (work_item_id, version)
);

CREATE INDEX entity_resolution_queue
  ON entity_resolution_work_items (status, updated_at DESC)
  WHERE status IN ('pending', 'conflict');

CREATE TRIGGER partner_ingestion_batches_no_mutation
BEFORE UPDATE OR DELETE ON partner_ingestion_batches
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ingestion_mutation();

CREATE TRIGGER partner_batch_records_no_mutation
BEFORE UPDATE OR DELETE ON partner_batch_records
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ingestion_mutation();

CREATE TRIGGER entity_resolution_events_no_mutation
BEFORE UPDATE OR DELETE ON entity_resolution_events
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ingestion_mutation();

COMMENT ON TABLE partner_ingestion_batches IS 'Immutable approved partner files, retained with exact bytes and checksum for replay and adapter contract audits.';
COMMENT ON TABLE entity_resolution_work_items IS 'Versioned operational queue separating source identity hints from RAMA canonical property identity.';
COMMENT ON TABLE entity_resolution_events IS 'Append-only entity-resolution decision audit.';

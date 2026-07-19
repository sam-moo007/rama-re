CREATE TYPE source_adapter_kind AS ENUM ('manual', 'partner_file');
CREATE TYPE raw_ingestion_status AS ENUM ('accepted', 'quarantined');
CREATE TYPE source_control_action AS ENUM ('created', 'disabled', 'enabled');

CREATE TABLE ingestion_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  display_name jsonb NOT NULL,
  adapter_kind source_adapter_kind NOT NULL,
  entitlement_reference text NOT NULL,
  allowed_evidence_classes evidence_class[] NOT NULL,
  active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz,
  disabled_by text,
  disabled_reason text,
  CHECK (cardinality(allowed_evidence_classes) > 0),
  CHECK (
    (active AND disabled_at IS NULL AND disabled_by IS NULL AND disabled_reason IS NULL)
    OR
    (NOT active AND disabled_at IS NOT NULL AND disabled_by IS NOT NULL AND disabled_reason IS NOT NULL)
  )
);

CREATE TABLE ingestion_source_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES ingestion_sources(id),
  action source_control_action NOT NULL,
  actor_id text NOT NULL,
  reason text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, version)
);

CREATE TABLE raw_ingestion_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES ingestion_sources(id),
  adapter_kind source_adapter_kind NOT NULL,
  idempotency_key text NOT NULL,
  schema_version text NOT NULL,
  property_slug text NOT NULL,
  claim_key text NOT NULL,
  evidence_class evidence_class NOT NULL,
  retrieved_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  submitted_by text NOT NULL,
  payload jsonb NOT NULL,
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
  artifact_object_key text NOT NULL,
  artifact_sha256 text NOT NULL CHECK (artifact_sha256 ~ '^[a-fA-F0-9]{64}$'),
  artifact_mime_type text NOT NULL,
  artifact_byte_size bigint NOT NULL CHECK (artifact_byte_size > 0),
  artifact_captured_at timestamptz,
  status raw_ingestion_status NOT NULL,
  UNIQUE (source_id, idempotency_key)
);

CREATE INDEX raw_ingestion_resolution_queue
  ON raw_ingestion_records (property_slug, claim_key, received_at DESC);

CREATE INDEX raw_ingestion_artifact_checksum
  ON raw_ingestion_records (artifact_sha256);

CREATE OR REPLACE FUNCTION prevent_immutable_ingestion_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is immutable', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raw_ingestion_records_no_mutation
BEFORE UPDATE OR DELETE ON raw_ingestion_records
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ingestion_mutation();

CREATE TRIGGER ingestion_source_events_no_mutation
BEFORE UPDATE OR DELETE ON ingestion_source_events
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_ingestion_mutation();

COMMENT ON TABLE ingestion_sources IS 'Approved source adapters with explicit entitlement, evidence-class allowlists and an operational kill switch.';
COMMENT ON TABLE ingestion_source_events IS 'Append-only audit of source creation, disable and re-enable actions.';
COMMENT ON TABLE raw_ingestion_records IS 'Immutable canonical JSON landing envelopes. Replays resolve through source-scoped idempotency keys.';
COMMENT ON COLUMN raw_ingestion_records.payload_sha256 IS 'SHA-256 of canonicalized JSON payload, independent from the artifact content checksum.';

-- ═══════════════════════════════════════════════════════════════════════════════
-- RAMA — Full Database Schema Migration
-- Run once in Supabase SQL Editor (after rama_supabase_setup.sql)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE evidence_class AS ENUM (
    'registry','document','on_site','provider','modelled','unknown'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE evidence_workflow_status AS ENUM (
    'pending_review','in_review','approved','rejected','stale','superseded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM (
    'draft','published','stale','superseded','retracted'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ingestion_adapter_kind AS ENUM (
    'manual','partner_csv','partner_api','dld_api','internal'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ingestion_record_status AS ENUM (
    'accepted','quarantined'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resolution_status AS ENUM (
    'queued','assigned','resolved','conflict','skipped'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── CATALOGUE ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS property_units (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_slug        TEXT NOT NULL UNIQUE,
  name                  JSONB NOT NULL DEFAULT '{}',
  community             JSONB NOT NULL DEFAULT '{}',
  record_kind           TEXT NOT NULL DEFAULT 'ready_ownership',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The catalogue projection is a denormalised read-model built from property_units + claims
CREATE TABLE IF NOT EXISTS property_catalogue_projection (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_slug            TEXT NOT NULL UNIQUE REFERENCES property_units(canonical_slug) ON UPDATE CASCADE,
  record_kind               TEXT NOT NULL,
  name                      JSONB NOT NULL DEFAULT '{}',
  community                 JSONB NOT NULL DEFAULT '{}',
  price_aed                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  bedrooms                  INT,
  bathrooms                 NUMERIC(4,1),
  internal_area_sq_ft       NUMERIC(10,2),
  tenure                    TEXT NOT NULL DEFAULT 'freehold',
  evidence_coverage         NUMERIC(5,4) NOT NULL DEFAULT 0,
  freshness                 TEXT NOT NULL DEFAULT 'stale',
  published_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  media_representation      TEXT NOT NULL DEFAULT 'stills',
  step_free_access          TEXT NOT NULL DEFAULT 'unknown',
  decision_room_available   BOOLEAN NOT NULL DEFAULT false,
  sponsored                 BOOLEAN NOT NULL DEFAULT false,
  missing_critical_evidence JSONB NOT NULL DEFAULT '[]',
  geo                       GEOGRAPHY(POINT, 4326),
  mobility                  JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS property_catalogue_published_at_idx
  ON property_catalogue_projection(published_at DESC);

CREATE INDEX IF NOT EXISTS property_catalogue_geo_idx
  ON property_catalogue_projection USING GIST(geo);

-- ─── EVIDENCE ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS evidence_sources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_key  TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claims (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_unit_id     UUID NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,
  source_id            UUID REFERENCES evidence_sources(id),
  claim_key            TEXT NOT NULL,
  label                JSONB NOT NULL DEFAULT '{}',
  value                JSONB,
  evidence_class       evidence_class NOT NULL DEFAULT 'unknown',
  status               claim_status NOT NULL DEFAULT 'draft',
  source_snapshot      JSONB,
  method               JSONB,
  observed_at          TIMESTAMPTZ,
  retrieved_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to             TIMESTAMPTZ,
  confidence           NUMERIC(3,2),
  artifact_reference   TEXT,
  supersedes_reference TEXT,
  supersedes_claim_id  UUID REFERENCES claims(id),
  is_critical          BOOLEAN NOT NULL DEFAULT false,
  next_verification_step JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claims_property_unit_idx ON claims(property_unit_id);
CREATE INDEX IF NOT EXISTS claims_status_idx ON claims(status);

CREATE TABLE IF NOT EXISTS evidence_work_items (
  id               UUID PRIMARY KEY REFERENCES claims(id) ON DELETE CASCADE,
  workflow_status  evidence_workflow_status NOT NULL DEFAULT 'pending_review',
  version          INT NOT NULL DEFAULT 1,
  assigned_to      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id     UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  decision     TEXT NOT NULL,
  reason       TEXT NOT NULL DEFAULT '',
  reviewer_id  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_corrections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id        UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  submitted_by    TEXT NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT
);

CREATE TABLE IF NOT EXISTS evidence_audit_trail (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_work_item_id UUID NOT NULL REFERENCES evidence_work_items(id) ON DELETE CASCADE,
  action                TEXT NOT NULL,
  actor_id              TEXT NOT NULL,
  reason                TEXT,
  from_status           evidence_workflow_status,
  to_status             evidence_workflow_status NOT NULL,
  version               INT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS evidence_audit_work_item_idx ON evidence_audit_trail(evidence_work_item_id);

-- ─── INGESTION ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ingestion_sources (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_key              TEXT NOT NULL UNIQUE,
  display_name            JSONB NOT NULL DEFAULT '{}',
  adapter_kind            TEXT NOT NULL,
  entitlement_reference   TEXT NOT NULL DEFAULT '',
  allowed_evidence_classes evidence_class[] NOT NULL DEFAULT '{}',
  active                  BOOLEAN NOT NULL DEFAULT true,
  version                 INT NOT NULL DEFAULT 1,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at             TIMESTAMPTZ,
  disabled_by             TEXT,
  disabled_reason         TEXT
);

CREATE TABLE IF NOT EXISTS ingestion_source_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id   UUID NOT NULL REFERENCES ingestion_sources(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  actor_id    TEXT NOT NULL,
  reason      TEXT NOT NULL DEFAULT '',
  version     INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingestion_source_events_source_idx ON ingestion_source_events(source_id);

CREATE TABLE IF NOT EXISTS raw_ingestion_records (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id           UUID NOT NULL REFERENCES ingestion_sources(id),
  adapter_kind        TEXT NOT NULL,
  idempotency_key     TEXT NOT NULL,
  schema_version      TEXT NOT NULL,
  property_slug       TEXT NOT NULL,
  claim_key           TEXT NOT NULL,
  evidence_class      evidence_class NOT NULL,
  retrieved_at        TIMESTAMPTZ NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_by        TEXT NOT NULL,
  external_entity_id  TEXT,
  partner_batch_id    UUID,
  payload             JSONB NOT NULL DEFAULT '{}',
  payload_sha256      TEXT NOT NULL,
  artifact_object_key TEXT NOT NULL,
  artifact_sha256     TEXT NOT NULL,
  artifact_mime_type  TEXT NOT NULL,
  artifact_byte_size  BIGINT NOT NULL,
  artifact_captured_at TIMESTAMPTZ,
  status              ingestion_record_status NOT NULL DEFAULT 'accepted',
  UNIQUE(source_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS raw_ingestion_records_source_idx ON raw_ingestion_records(source_id);
CREATE INDEX IF NOT EXISTS raw_ingestion_records_received_idx ON raw_ingestion_records(received_at DESC);

CREATE TABLE IF NOT EXISTS partner_ingestion_batches (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id             UUID NOT NULL REFERENCES ingestion_sources(id),
  batch_idempotency_key TEXT NOT NULL,
  schema_version        TEXT NOT NULL,
  retrieved_at          TIMESTAMPTZ NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_by          TEXT NOT NULL,
  artifact_object_key   TEXT NOT NULL,
  artifact_sha256       TEXT NOT NULL,
  artifact_mime_type    TEXT NOT NULL,
  artifact_byte_size    BIGINT NOT NULL,
  artifact_captured_at  TIMESTAMPTZ,
  content_sha256        TEXT NOT NULL,
  raw_content           BYTEA,
  row_count             INT NOT NULL DEFAULT 0,
  UNIQUE(source_id, batch_idempotency_key)
);

CREATE TABLE IF NOT EXISTS partner_batch_records (
  batch_id      UUID NOT NULL REFERENCES partner_ingestion_batches(id) ON DELETE CASCADE,
  row_index     INT NOT NULL,
  raw_record_id UUID NOT NULL REFERENCES raw_ingestion_records(id),
  replayed      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (batch_id, row_index)
);

CREATE TABLE IF NOT EXISTS entity_resolution_work_items (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_record_id           UUID NOT NULL REFERENCES raw_ingestion_records(id),
  external_entity_id      TEXT NOT NULL,
  submitted_property_slug TEXT NOT NULL,
  status                  resolution_status NOT NULL DEFAULT 'queued',
  canonical_property_slug TEXT,
  version                 INT NOT NULL DEFAULT 1,
  assigned_to             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_resolution_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_item_id  UUID NOT NULL REFERENCES entity_resolution_work_items(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  reason        TEXT NOT NULL DEFAULT '',
  from_status   resolution_status,
  to_status     resolution_status NOT NULL,
  version       INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entity_resolution_events_work_item_idx ON entity_resolution_events(work_item_id);

-- ─── HOUSEHOLD BRIEFS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS household_briefs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_subject   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft',
  version         INT NOT NULL DEFAULT 1,
  input           JSONB NOT NULL DEFAULT '{}',
  readiness       JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS household_briefs_owner_idx ON household_briefs(owner_subject);

CREATE TABLE IF NOT EXISTS household_brief_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id    UUID NOT NULL REFERENCES household_briefs(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  actor_id    TEXT NOT NULL,
  reason      TEXT NOT NULL DEFAULT '',
  version     INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS household_brief_events_brief_idx ON household_brief_events(brief_id);

-- ─── SHORTLISTS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customer_shortlists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_subject   TEXT NOT NULL UNIQUE,
  version         INT NOT NULL DEFAULT 1,
  property_slugs  TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_shortlist_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shortlist_id  UUID NOT NULL REFERENCES customer_shortlists(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  version       INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_shortlist_events_shortlist_idx ON customer_shortlist_events(shortlist_id);

-- ─── DECISION CASES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decision_cases (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_subject             TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'requested',
  version                   INT NOT NULL DEFAULT 1,
  brief_id                  UUID REFERENCES household_briefs(id),
  brief_version             INT NOT NULL DEFAULT 0,
  shortlist_id              UUID REFERENCES customer_shortlists(id),
  shortlist_version         INT NOT NULL DEFAULT 0,
  property_slugs            TEXT[] NOT NULL DEFAULT '{}',
  reason                    TEXT NOT NULL DEFAULT '',
  topics                    TEXT[] NOT NULL DEFAULT '{}',
  preferred_contact_channel TEXT NOT NULL DEFAULT 'email',
  advisor_id                TEXT,
  response_sla_hours        INT NOT NULL DEFAULT 24,
  response_due_at           TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  assigned_at               TIMESTAMPTZ,
  closed_at                 TIMESTAMPTZ,
  retention_until           TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '2 years',
  data_policy_version       TEXT NOT NULL DEFAULT 'v1',
  advisor_context           JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decision_cases_owner_idx ON decision_cases(owner_subject);
CREATE INDEX IF NOT EXISTS decision_cases_status_idx ON decision_cases(status);
CREATE INDEX IF NOT EXISTS decision_cases_retention_idx ON decision_cases(retention_until);

CREATE TABLE IF NOT EXISTS decision_case_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES decision_cases(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  actor_id    TEXT NOT NULL,
  actor_role  TEXT NOT NULL,
  version     INT NOT NULL,
  reason_code TEXT NOT NULL DEFAULT 'none',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decision_case_events_case_idx ON decision_case_events(case_id);

-- Prevent hard delete without retention flag
CREATE OR REPLACE RULE no_hard_delete_cases AS
  ON DELETE TO decision_cases
  WHERE current_setting('rama.retention_purge', true) IS DISTINCT FROM 'on'
  DO INSTEAD NOTHING;

-- ─── COMMUNICATIONS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS protected_contact_profiles (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_subject                   TEXT NOT NULL UNIQUE,
  version                         INT NOT NULL DEFAULT 1,
  locale                          TEXT NOT NULL DEFAULT 'en',
  email_encrypted                 TEXT,
  email_masked                    TEXT,
  email_status                    TEXT,
  email_verification_hash         TEXT,
  email_verification_expires_at   TIMESTAMPTZ,
  email_verification_attempts     INT DEFAULT 0,
  email_verification_requested_at TIMESTAMPTZ,
  email_verified_at               TIMESTAMPTZ,
  phone_encrypted                 TEXT,
  phone_masked                    TEXT,
  phone_status                    TEXT,
  phone_verification_hash         TEXT,
  phone_verification_expires_at   TIMESTAMPTZ,
  phone_verification_attempts     INT DEFAULT 0,
  phone_verification_requested_at TIMESTAMPTZ,
  phone_verified_at               TIMESTAMPTZ,
  preferences                     JSONB NOT NULL DEFAULT '{}',
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_profile_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES protected_contact_profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  version     INT NOT NULL,
  channel     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID,
  owner_subject     TEXT NOT NULL,
  advisor_subject   TEXT,
  case_version      INT NOT NULL DEFAULT 0,
  version           INT NOT NULL DEFAULT 1,
  template          TEXT NOT NULL,
  requested_channel TEXT NOT NULL DEFAULT 'in_app',
  delivered_channel TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  delivery_reason   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at           TIMESTAMPTZ,
  retention_until   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '90 days'
);

CREATE INDEX IF NOT EXISTS customer_notifications_owner_idx ON customer_notifications(owner_subject);
CREATE INDEX IF NOT EXISTS customer_notifications_retention_idx ON customer_notifications(retention_until);

CREATE TABLE IF NOT EXISTS notification_delivery_outbox (
  notification_id UUID PRIMARY KEY REFERENCES customer_notifications(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending',
  attempt_count   INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at       TIMESTAMPTZ,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_delivery_outbox_status_idx
  ON notification_delivery_outbox(status, next_attempt_at)
  WHERE status IN ('pending','retry_pending','processing');

-- ─── ROW-LEVEL SECURITY ──────────────────────────────────────────────────────
-- RLS ensures users can only see their own rows when using the anon/user JWT.
-- Staff bypass via service_role key.

ALTER TABLE household_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner_access_briefs"
  ON household_briefs FOR ALL
  USING (owner_subject = auth.uid()::text);

ALTER TABLE customer_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner_access_shortlists"
  ON customer_shortlists FOR ALL
  USING (owner_subject = auth.uid()::text);

ALTER TABLE decision_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner_access_cases"
  ON decision_cases FOR ALL
  USING (owner_subject = auth.uid()::text);

ALTER TABLE protected_contact_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner_access_contacts"
  ON protected_contact_profiles FOR ALL
  USING (owner_subject = auth.uid()::text);

ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner_access_notifications"
  ON customer_notifications FOR ALL
  USING (owner_subject = auth.uid()::text);

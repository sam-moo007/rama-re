CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE evidence_class AS ENUM (
  'registry_regulator',
  'document_verified',
  'on_site_observed',
  'provider_attested',
  'modelled',
  'unverified_unknown'
);

CREATE TYPE claim_status AS ENUM (
  'verified',
  'review',
  'stale',
  'unknown'
);

CREATE TABLE property_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_slug text UNIQUE NOT NULL,
  external_ids jsonb NOT NULL DEFAULT '{}',
  building_id uuid,
  project_id uuid,
  name jsonb NOT NULL,
  location geography(Point, 4326),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_unit_id uuid NOT NULL REFERENCES property_units(id),
  provider_id text NOT NULL,
  advert_permit text,
  version integer NOT NULL DEFAULT 1,
  price_aed numeric(14, 2) NOT NULL,
  availability text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  UNIQUE (property_unit_id, provider_id, version)
);

CREATE TABLE evidence_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key text UNIQUE NOT NULL,
  display_name jsonb NOT NULL,
  entitlement_reference text,
  retrieval_policy jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE evidence_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES evidence_sources(id),
  object_key text NOT NULL,
  sha256 text NOT NULL,
  mime_type text NOT NULL,
  classification text NOT NULL,
  observed_at timestamptz,
  retrieved_at timestamptz NOT NULL,
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sha256, object_key)
);

CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_unit_id uuid NOT NULL REFERENCES property_units(id),
  claim_key text NOT NULL,
  value jsonb,
  unit text,
  evidence_class evidence_class NOT NULL,
  status claim_status NOT NULL,
  method jsonb NOT NULL,
  source_id uuid REFERENCES evidence_sources(id),
  artifact_id uuid REFERENCES evidence_artifacts(id),
  confidence numeric(5, 4),
  verifier_id text,
  observed_at timestamptz,
  retrieved_at timestamptz NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  supersedes_claim_id uuid REFERENCES claims(id),
  published_at timestamptz,
  CONSTRAINT claim_confidence_range CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1)
);

CREATE UNIQUE INDEX claims_current_version
  ON claims (property_unit_id, claim_key)
  WHERE superseded_at IS NULL;

CREATE INDEX claims_freshness_queue
  ON claims (valid_to, status)
  WHERE superseded_at IS NULL;

CREATE TABLE claim_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id),
  reviewer_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_information')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id),
  submitted_by text NOT NULL,
  reason text NOT NULL,
  evidence_artifact_id uuid REFERENCES evidence_artifacts(id),
  status text NOT NULL CHECK (status IN ('open', 'triaged', 'resolved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolution_note text
);

COMMENT ON TABLE claims IS 'Claim-level, bitemporal provenance. Aggregate coverage must never be interpreted as property quality or legal status.';

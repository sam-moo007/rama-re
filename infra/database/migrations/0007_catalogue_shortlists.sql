CREATE TABLE property_catalogue_projection (
  id uuid PRIMARY KEY REFERENCES property_units(id),
  canonical_slug text UNIQUE NOT NULL,
  record_kind text NOT NULL CHECK (record_kind IN ('curated', 'synthetic_demo')),
  name jsonb NOT NULL,
  community jsonb NOT NULL,
  price_aed bigint NOT NULL CHECK (price_aed > 0),
  bedrooms smallint CHECK (bedrooms BETWEEN 0 AND 12),
  bathrooms numeric(4, 1) CHECK (bathrooms BETWEEN 0 AND 12),
  internal_area_sq_ft integer CHECK (internal_area_sq_ft > 0),
  tenure text NOT NULL CHECK (tenure IN ('ready', 'off_plan')),
  evidence_coverage smallint NOT NULL CHECK (evidence_coverage BETWEEN 0 AND 100),
  freshness text NOT NULL CHECK (freshness IN ('fresh', 'review', 'stale')),
  published_at timestamptz NOT NULL,
  media_representation text NOT NULL CHECK (media_representation IN ('exact_unit', 'same_type', 'representative', 'artist_impression')),
  step_free_access text NOT NULL CHECK (step_free_access IN ('verified', 'review', 'unknown')),
  decision_room_available boolean NOT NULL DEFAULT false,
  sponsored boolean NOT NULL DEFAULT false,
  missing_critical_evidence jsonb NOT NULL DEFAULT '[]',
  projected_at timestamptz NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(name) = 'object'),
  CHECK (jsonb_typeof(community) = 'object'),
  CHECK (jsonb_typeof(missing_critical_evidence) = 'array')
);

CREATE INDEX property_catalogue_price ON property_catalogue_projection (price_aed);
CREATE INDEX property_catalogue_bedrooms ON property_catalogue_projection (bedrooms);
CREATE INDEX property_catalogue_evidence ON property_catalogue_projection (evidence_coverage DESC, freshness);
CREATE INDEX property_catalogue_published ON property_catalogue_projection (published_at DESC);
CREATE INDEX property_catalogue_name_search ON property_catalogue_projection USING gin (
  to_tsvector('simple', coalesce(name->>'en', '') || ' ' || coalesce(name->>'ar', '') || ' ' || coalesce(community->>'en', '') || ' ' || coalesce(community->>'ar', ''))
);

COMMENT ON TABLE property_catalogue_projection IS
  'Customer search projection rebuilt from canonical property, listing and evidence state. Evidence coverage is not a quality score.';

CREATE OR REPLACE FUNCTION text_array_values_are_unique(values_to_check text[])
RETURNS boolean AS $$
  SELECT cardinality(values_to_check) = COUNT(DISTINCT value)
  FROM unnest(values_to_check) AS value;
$$ LANGUAGE sql IMMUTABLE;

CREATE TABLE customer_shortlists (
  id uuid PRIMARY KEY,
  owner_subject text UNIQUE NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  property_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (cardinality(property_slugs) <= 20),
  CHECK (text_array_values_are_unique(property_slugs))
);

CREATE TABLE customer_shortlist_events (
  id uuid PRIMARY KEY,
  shortlist_id uuid NOT NULL REFERENCES customer_shortlists(id),
  action text NOT NULL CHECK (action IN ('created', 'updated')),
  actor_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL,
  UNIQUE (shortlist_id, version)
);

CREATE OR REPLACE FUNCTION prevent_shortlist_event_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'customer shortlist events are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_shortlist_events_no_update
BEFORE UPDATE OR DELETE ON customer_shortlist_events
FOR EACH ROW EXECUTE FUNCTION prevent_shortlist_event_mutation();

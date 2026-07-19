CREATE TYPE household_brief_status AS ENUM ('draft', 'submitted');
CREATE TYPE household_brief_action AS ENUM ('created', 'updated', 'submitted');

CREATE TABLE household_briefs (
  id uuid PRIMARY KEY,
  owner_subject text NOT NULL,
  status household_brief_status NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  input jsonb NOT NULL,
  readiness jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  submitted_at timestamptz
);

CREATE INDEX household_briefs_owner_updated_idx
  ON household_briefs (owner_subject, updated_at DESC);

CREATE TABLE household_brief_events (
  id uuid PRIMARY KEY,
  brief_id uuid NOT NULL REFERENCES household_briefs(id) ON DELETE CASCADE,
  action household_brief_action NOT NULL,
  actor_id text NOT NULL,
  reason text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL,
  UNIQUE (brief_id, version)
);

CREATE OR REPLACE FUNCTION prevent_household_brief_event_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'household brief events are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER household_brief_events_no_update
BEFORE UPDATE OR DELETE ON household_brief_events
FOR EACH ROW EXECUTE FUNCTION prevent_household_brief_event_mutation();

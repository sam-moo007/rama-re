ALTER TYPE household_brief_action ADD VALUE IF NOT EXISTS 'consent_updated';

CREATE TYPE decision_case_status AS ENUM ('requested', 'assigned', 'cancelled', 'closed');
CREATE TYPE decision_case_action AS ENUM ('requested', 'claimed', 'cancelled', 'closed');
CREATE TYPE decision_case_actor_role AS ENUM ('customer', 'advisor');

CREATE TABLE decision_cases (
  id uuid PRIMARY KEY,
  owner_subject text NOT NULL,
  status decision_case_status NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  brief_id uuid NOT NULL REFERENCES household_briefs(id),
  brief_version integer NOT NULL CHECK (brief_version > 0),
  shortlist_id uuid NOT NULL REFERENCES customer_shortlists(id),
  shortlist_version integer NOT NULL CHECK (shortlist_version > 0),
  property_slugs text[] NOT NULL,
  reason text NOT NULL CHECK (reason IN ('property_questions','financing_readiness','viewing_request','accessibility_review')),
  topics text[] NOT NULL,
  preferred_contact_channel text NOT NULL CHECK (preferred_contact_channel IN ('in_app','phone','email')),
  advisor_id text,
  response_sla_hours integer NOT NULL CHECK (response_sla_hours = 4),
  response_due_at timestamptz NOT NULL,
  assigned_at timestamptz,
  closed_at timestamptz,
  retention_until timestamptz NOT NULL,
  data_policy_version text NOT NULL CHECK (data_policy_version = 'rama.customer-handoff.phase1.v1'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (cardinality(property_slugs) BETWEEN 1 AND 4),
  CHECK (text_array_values_are_unique(property_slugs)),
  CHECK (cardinality(topics) BETWEEN 1 AND 5),
  CHECK (text_array_values_are_unique(topics)),
  CHECK (retention_until > created_at),
  CHECK ((status = 'requested' AND advisor_id IS NULL AND assigned_at IS NULL) OR status <> 'requested'),
  CHECK ((status = 'assigned' AND advisor_id IS NOT NULL AND assigned_at IS NOT NULL) OR status <> 'assigned')
);

CREATE UNIQUE INDEX one_active_decision_case_per_customer
  ON decision_cases (owner_subject) WHERE status IN ('requested','assigned');
CREATE INDEX decision_case_advisor_queue ON decision_cases (status, response_due_at, advisor_id);

CREATE TABLE decision_case_events (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES decision_cases(id),
  action decision_case_action NOT NULL,
  actor_id text NOT NULL,
  actor_role decision_case_actor_role NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  reason_code text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (case_id, version)
);

CREATE OR REPLACE FUNCTION prevent_decision_case_event_mutation()
RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'decision case events are append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER decision_case_events_no_update BEFORE UPDATE OR DELETE ON decision_case_events
FOR EACH ROW EXECUTE FUNCTION prevent_decision_case_event_mutation();


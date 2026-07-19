CREATE TYPE evidence_workflow_status AS ENUM (
  'draft',
  'in_review',
  'approved',
  'published',
  'expired',
  'superseded'
);

CREATE TABLE evidence_work_items (
  id uuid PRIMARY KEY REFERENCES claims(id),
  workflow_status evidence_workflow_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX evidence_work_queue
  ON evidence_work_items (workflow_status, updated_at DESC)
  WHERE workflow_status IN ('draft', 'in_review', 'approved');

CREATE TABLE evidence_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_work_item_id uuid NOT NULL REFERENCES evidence_work_items(id),
  action text NOT NULL CHECK (
    action IN ('seeded', 'reviewed', 'published', 'expired', 'correction_requested', 'superseded')
  ),
  actor_id text NOT NULL,
  reason text,
  from_status evidence_workflow_status,
  to_status evidence_workflow_status NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (evidence_work_item_id, version)
);

CREATE OR REPLACE FUNCTION prevent_evidence_audit_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'evidence_audit_events is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evidence_audit_events_no_update
BEFORE UPDATE OR DELETE ON evidence_audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_evidence_audit_mutation();

COMMENT ON TABLE evidence_work_items IS 'Operational state and optimistic version for claim review, publication, expiry, correction and supersession.';
COMMENT ON TABLE evidence_audit_events IS 'Append-only workflow audit. Each work-item version produces exactly one transition event.';

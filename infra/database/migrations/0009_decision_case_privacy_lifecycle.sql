ALTER TABLE decision_cases ADD COLUMN advisor_context jsonb;

UPDATE decision_cases AS c
SET advisor_context = jsonb_build_object(
  'snapshotVersion', 'rama.advisor-context.v1',
  'capturedAt', c.created_at,
  'purchasePurpose', b.input->'purchasePurpose',
  'moveTimeframe', b.input->'moveTimeframe',
  'maxPurchasePriceAed', b.input->'maxPurchasePriceAed',
  'financingNeeded', b.input->'financingNeeded',
  'minBedrooms', b.input->'minBedrooms',
  'preferredCommunities', b.input->'preferredCommunities',
  'tenurePreference', b.input->'tenurePreference',
  'priorities', b.input->'priorities',
  'accessibility', b.input->'accessibility',
  'readiness', jsonb_build_object(
    'classification', b.readiness->'classification',
    'blockers', b.readiness->'blockers',
    'assumptionVersion', b.readiness->'assumptionVersion',
    'disclaimer', b.readiness->'disclaimer'
  )
)
FROM household_briefs AS b
WHERE b.id = c.brief_id;

ALTER TABLE decision_cases ALTER COLUMN advisor_context SET NOT NULL;
CREATE INDEX decision_case_retention_due_idx ON decision_cases (retention_until);

CREATE OR REPLACE FUNCTION prevent_decision_case_event_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('rama.retention_purge', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'decision case events are append-only until their declared retention period expires';
END;
$$ LANGUAGE plpgsql;

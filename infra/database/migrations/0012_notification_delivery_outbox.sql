ALTER TABLE customer_notifications ADD COLUMN IF NOT EXISTS case_version integer;
UPDATE customer_notifications notification SET case_version = decision.version
FROM decision_cases decision WHERE notification.case_id = decision.id AND notification.case_version IS NULL;
ALTER TABLE customer_notifications ALTER COLUMN case_version SET NOT NULL;
ALTER TABLE customer_notifications ADD CONSTRAINT customer_notifications_case_version_positive CHECK (case_version > 0);

DO $$ DECLARE item record; BEGIN
  FOR item IN SELECT conname FROM pg_constraint WHERE conrelid='customer_notifications'::regclass AND contype='c' AND (pg_get_constraintdef(oid) LIKE '%delivery_reason%' OR pg_get_constraintdef(oid) LIKE '%delivered_channel%')
  LOOP EXECUTE format('ALTER TABLE customer_notifications DROP CONSTRAINT %I',item.conname); END LOOP;
END $$;

ALTER TABLE customer_notifications ADD CONSTRAINT customer_notifications_delivery_reason_check
  CHECK (delivery_reason IN ('delivery_queued','direct_in_app','verified_contact','contact_missing','contact_unverified','channel_opted_out','fallback_disabled','provider_failed','case_unavailable'));
ALTER TABLE customer_notifications ADD CONSTRAINT customer_notifications_delivery_state_check
  CHECK (((status IN ('failed','queued','retrying')) AND delivered_channel IS NULL) OR ((status IN ('delivered','fallback_delivered')) AND delivered_channel IS NOT NULL));

CREATE TYPE notification_outbox_status AS ENUM ('pending','processing','retry_pending','completed','dead_letter');
CREATE TABLE notification_delivery_outbox (
  notification_id uuid PRIMARY KEY REFERENCES customer_notifications(id) ON DELETE CASCADE,
  status notification_outbox_status NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 5),
  next_attempt_at timestamptz NOT NULL,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK ((status = 'processing' AND locked_at IS NOT NULL) OR (status <> 'processing' AND locked_at IS NULL))
);
CREATE INDEX notification_delivery_outbox_due_idx ON notification_delivery_outbox(next_attempt_at) WHERE status IN ('pending','retry_pending');

CREATE TYPE contact_point_status AS ENUM ('unverified','verification_pending','verified');
CREATE TYPE contact_profile_action AS ENUM ('created','contact_points_updated','preferences_updated','verification_requested','verification_failed','contact_verified');
CREATE TYPE contact_verification_channel AS ENUM ('email','sms');
CREATE TYPE notification_delivery_channel AS ENUM ('in_app','email','sms');
CREATE TYPE notification_delivery_status AS ENUM ('queued','retrying','delivered','fallback_delivered','failed');

CREATE TABLE protected_contact_profiles (
  id uuid PRIMARY KEY,
  owner_subject text NOT NULL UNIQUE,
  version integer NOT NULL CHECK (version > 0),
  locale text NOT NULL CHECK (locale IN ('en','ar')),
  email_encrypted text,
  email_masked text,
  email_status contact_point_status,
  email_verification_hash text,
  email_verification_expires_at timestamptz,
  email_verification_attempts integer CHECK (email_verification_attempts BETWEEN 0 AND 5),
  email_verification_requested_at timestamptz,
  email_verified_at timestamptz,
  phone_encrypted text,
  phone_masked text,
  phone_status contact_point_status,
  phone_verification_hash text,
  phone_verification_expires_at timestamptz,
  phone_verification_attempts integer CHECK (phone_verification_attempts BETWEEN 0 AND 5),
  phone_verification_requested_at timestamptz,
  phone_verified_at timestamptz,
  preferences jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK ((email_encrypted IS NULL AND email_masked IS NULL AND email_status IS NULL) OR (email_encrypted IS NOT NULL AND email_masked IS NOT NULL AND email_status IS NOT NULL)),
  CHECK ((phone_encrypted IS NULL AND phone_masked IS NULL AND phone_status IS NULL) OR (phone_encrypted IS NOT NULL AND phone_masked IS NOT NULL AND phone_status IS NOT NULL)),
  CHECK (email_encrypted IS NOT NULL OR phone_encrypted IS NOT NULL),
  CHECK (preferences @> '{"caseUpdatesInApp":true}'::jsonb)
);

CREATE TABLE contact_profile_events (
  id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES protected_contact_profiles(id) ON DELETE CASCADE,
  action contact_profile_action NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  channel contact_verification_channel,
  created_at timestamptz NOT NULL,
  UNIQUE (profile_id,version)
);

CREATE OR REPLACE FUNCTION prevent_contact_profile_event_mutation()
RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'contact profile events are append-only'; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER contact_profile_events_no_update BEFORE UPDATE OR DELETE ON contact_profile_events
FOR EACH ROW EXECUTE FUNCTION prevent_contact_profile_event_mutation();

CREATE TABLE customer_notifications (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES decision_cases(id) ON DELETE CASCADE,
  owner_subject text NOT NULL,
  advisor_subject text NOT NULL,
  case_version integer NOT NULL CHECK (case_version > 0),
  version integer NOT NULL CHECK (version > 0),
  template text NOT NULL CHECK (template IN ('advisor_acknowledgement','information_request','questions_answered','viewing_coordination','financing_follow_up')),
  requested_channel notification_delivery_channel NOT NULL,
  delivered_channel notification_delivery_channel,
  status notification_delivery_status NOT NULL,
  delivery_reason text NOT NULL CONSTRAINT customer_notifications_delivery_reason_check CHECK (delivery_reason IN ('delivery_queued','direct_in_app','verified_contact','contact_missing','contact_unverified','channel_opted_out','fallback_disabled','provider_failed','case_unavailable')),
  created_at timestamptz NOT NULL,
  read_at timestamptz,
  retention_until timestamptz NOT NULL,
  CHECK (retention_until > created_at),
  CONSTRAINT customer_notifications_delivery_state_check CHECK (((status IN ('failed','queued','retrying')) AND delivered_channel IS NULL) OR ((status IN ('delivered','fallback_delivered')) AND delivered_channel IS NOT NULL))
);

CREATE INDEX customer_notifications_owner_created_idx ON customer_notifications(owner_subject,created_at DESC);
CREATE INDEX customer_notifications_retention_idx ON customer_notifications(retention_until);

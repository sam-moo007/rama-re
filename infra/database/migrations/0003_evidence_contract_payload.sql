ALTER TABLE claims
  ADD COLUMN label jsonb NOT NULL DEFAULT '{"en":"Unlabelled claim","ar":"مطالبة بلا تسمية"}'::jsonb,
  ADD COLUMN source_snapshot jsonb NOT NULL DEFAULT '{"en":"Unknown source","ar":"مصدر غير معروف"}'::jsonb,
  ADD COLUMN next_verification_step jsonb,
  ADD COLUMN artifact_reference text,
  ADD COLUMN supersedes_reference text,
  ADD COLUMN is_critical boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN claims.label IS 'Localized customer-facing claim label retained with the canonical claim version.';
COMMENT ON COLUMN claims.source_snapshot IS 'Localized source wording shown when the claim was recorded; the normalized source relation remains authoritative for entitlement.';
COMMENT ON COLUMN claims.next_verification_step IS 'Localized, explicit next action for incomplete or uncertain evidence.';
COMMENT ON COLUMN claims.artifact_reference IS 'External/manual artifact reference only. Immutable managed artifacts continue to use artifact_id and sha256.';
COMMENT ON COLUMN claims.supersedes_reference IS 'External provenance/version reference when supersession does not point to an internal claim UUID.';
COMMENT ON COLUMN claims.is_critical IS 'Whether absence or expiry of this claim materially affects the decision journey.';

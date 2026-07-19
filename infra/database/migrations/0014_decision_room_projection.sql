-- Migration 0014: Property Decision Room Projection

-- This projection table stores the pre-computed decision room payload.
-- The payload is a denormalized JSON object conforming to the PropertyDecisionRoom schema.
-- It avoids expensive live-joins across claims, costs, risks, and media when serving the frontend.

CREATE TABLE IF NOT EXISTS property_decision_room_projection (
  canonical_slug TEXT PRIMARY KEY REFERENCES property_catalogue_projection(canonical_slug) ON DELETE CASCADE,
  room_payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for checking stale projections
CREATE INDEX IF NOT EXISTS idx_property_decision_room_updated_at 
ON property_decision_room_projection(updated_at);

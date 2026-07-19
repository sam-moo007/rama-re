ALTER TABLE property_catalogue_projection
  ADD COLUMN geo jsonb,
  ADD COLUMN geo_point geography(Point,4326),
  ADD COLUMN mobility jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE property_catalogue_projection
  ADD CONSTRAINT property_catalogue_geo_object CHECK (geo IS NULL OR jsonb_typeof(geo)='object'),
  ADD CONSTRAINT property_catalogue_mobility_array CHECK (jsonb_typeof(mobility)='array');

CREATE OR REPLACE FUNCTION sync_catalogue_geo_point()
RETURNS trigger AS $$
BEGIN
  NEW.geo_point := CASE WHEN NEW.geo IS NULL THEN NULL ELSE
    ST_SetSRID(ST_MakePoint((NEW.geo->>'longitude')::double precision,(NEW.geo->>'latitude')::double precision),4326)::geography
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_catalogue_geo_point_sync
BEFORE INSERT OR UPDATE OF geo ON property_catalogue_projection
FOR EACH ROW EXECUTE FUNCTION sync_catalogue_geo_point();

CREATE INDEX property_catalogue_geo_gist ON property_catalogue_projection USING gist (geo_point);
CREATE INDEX property_catalogue_mobility_gin ON property_catalogue_projection USING gin (mobility jsonb_path_ops);

COMMENT ON COLUMN property_catalogue_projection.geo IS
  'Evidence-labelled customer geo projection; null means location evidence is unavailable.';
COMMENT ON COLUMN property_catalogue_projection.mobility IS
  'Evidence-labelled present, committed or modelled travel projections. Durations are assumptions, not guarantees.';

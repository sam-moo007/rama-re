-- RAMA: Seed first organisation and promote an admin user
-- ─────────────────────────────────────────────────────────
-- INSTRUCTIONS:
--   1. Sign up a user via Supabase Auth (email + password or OAuth) first.
--   2. Find their UUID in: Supabase Dashboard → Authentication → Users → copy ID
--   3. Replace '<USER_UUID_FROM_AUTH_USERS>' below with that UUID.
--   4. Run this entire script in the Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────

DO $$
DECLARE
  v_org_id  UUID;
  v_user_id UUID := 'c6997c7c-aa3d-4049-8a6d-d5ce48258363'; -- admin@rama.app (seeded 2026-07-18)
BEGIN
  -- 1. Create the organisation
  INSERT INTO public.organizations (name, slug)
  VALUES ('Rama HQ', 'rama-hq')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_org_id;

  -- If the org already existed, fetch its id
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'rama-hq';
  END IF;

  -- 2. Upsert the admin profile
  INSERT INTO public.profiles (id, email, organization_id, roles, is_staff)
  SELECT
    v_user_id,
    au.email,
    v_org_id,
    ARRAY['staff', 'admin'],
    true
  FROM auth.users au
  WHERE au.id = v_user_id
  ON CONFLICT (id) DO UPDATE
    SET roles         = ARRAY['staff', 'admin'],
        is_staff      = true,
        organization_id = EXCLUDED.organization_id;

  RAISE NOTICE 'Done. Org id: %, User id: %', v_org_id, v_user_id;
END $$;

-- RAMA Supabase Initialization Script
-- 1. Create Tables for Organizations and Profiles
-- 2. Create the Custom Access Token Hook for JWT claims

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    organization_id UUID REFERENCES public.organizations(id),
    roles TEXT[] DEFAULT '{}',
    is_staff BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Custom Access Token Hook
-- This injects the rama_roles, rama_org_id, and MFA acr claims into the JWT 
-- so Rama's API can validate the token properly.
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_roles text[];
  user_org_id text;
BEGIN
  claims := event->'claims';
  
  -- Fetch roles/org from your own tables
  SELECT roles, organization_id::text 
  INTO user_roles, user_org_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := jsonb_set(claims, '{rama_roles}', to_jsonb(COALESCE(user_roles, ARRAY[]::text[])));
  
  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{rama_org_id}', to_jsonb(user_org_id));
  END IF;
  
  -- Set ACR if MFA is verified (aal2)
  IF event->'claims'->>'aal' = 'aal2' THEN
    claims := jsonb_set(claims, '{acr}', '"urn:rama:loa:2"');
  ELSE
    claims := jsonb_set(claims, '{acr}', '"urn:rama:loa:1"');
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant Supabase Auth execution rights
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- NOTE: You MUST go to the Supabase Dashboard -> Authentication -> Hooks
-- and enable the "Custom Access Token Hook", pointing it to public.custom_access_token_hook

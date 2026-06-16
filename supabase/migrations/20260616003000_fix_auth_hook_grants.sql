-- Fix: grant supabase_auth_admin SELECT on profiles.
-- The custom_access_token_hook runs as supabase_auth_admin and queries profiles
-- to inject tenant_id/user_role into the JWT. Without this grant the hook
-- throws "unexpected_failure" on every signUp/signIn.
-- supabase_auth_admin has BYPASSRLS so it reads all rows regardless of policies.

grant usage on schema public to supabase_auth_admin;
grant select on table public.profiles to supabase_auth_admin;

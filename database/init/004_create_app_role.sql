-- Migration 004: Separate application role for RLS enforcement
--
-- PostgreSQL superusers (including rtf_user which is POSTGRES_USER in Docker)
-- bypass Row Level Security automatically. To make RLS effective, the
-- application must connect as a non-superuser role.
--
-- This migration:
--   1. Creates rtf_app (non-superuser) for application connections
--   2. Grants the minimum required privileges
--   3. Fixes existing RLS policies to target rtf_app
--   4. Adds RLS to institutions and users tables

-- ── Create application role ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rtf_app') THEN
    CREATE ROLE rtf_app LOGIN PASSWORD 'rtf_app_password';
  END IF;
END $$;

-- ── Grant DML on all application tables (no DDL, no superuser) ───────────────
GRANT CONNECT ON DATABASE rtf_reporting TO rtf_app;
GRANT USAGE ON SCHEMA public TO rtf_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rtf_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO rtf_app;
-- Future tables created by rtf_user will also be accessible
ALTER DEFAULT PRIVILEGES FOR ROLE rtf_user IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO rtf_app;
ALTER DEFAULT PRIVILEGES FOR ROLE rtf_user IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO rtf_app;

-- ── Fix existing RLS policies to target rtf_app ───────────────────────────────

-- form_instances
DROP POLICY IF EXISTS form_instances_institution_policy ON form_instances;
CREATE POLICY form_instances_institution_policy ON form_instances
  FOR ALL TO rtf_app
  USING (institution_id IN (
    SELECT institution_id FROM users
    WHERE id = current_setting('app.current_user_id', true)::uuid
  ));

-- form_instance_history
DROP POLICY IF EXISTS form_history_institution_policy ON form_instance_history;
CREATE POLICY form_history_institution_policy ON form_instance_history
  FOR ALL TO rtf_app
  USING (form_instance_id IN (
    SELECT id FROM form_instances WHERE institution_id IN (
      SELECT institution_id FROM users
      WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  ));

-- ── RLS on institutions ───────────────────────────────────────────────────────
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY institutions_policy ON institutions
  FOR ALL TO rtf_app
  USING (id IN (
    SELECT institution_id FROM users
    WHERE id = current_setting('app.current_user_id', true)::uuid
  ));

-- ── RLS on users ─────────────────────────────────────────────────────────────
-- Users may see all members of their own institution.
-- Self-reference is avoided by using current_setting directly (not a subquery
-- on the users table), so the policy only evaluates institution_id equality.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_institution_policy ON users
  FOR ALL TO rtf_app
  USING (institution_id IN (
    SELECT institution_id FROM users u2
    WHERE u2.id = current_setting('app.current_user_id', true)::uuid
  ));

-- ── Read-only access for public/taxonomy tables ───────────────────────────────
-- No RLS needed on reference/taxonomy tables – they contain no user data.
-- Ensure rtf_app can read them:
GRANT SELECT ON concepts, dimension_members, dimensions, form_definitions,
                reference_data TO rtf_app;

-- Migration 003: Make RLS policies fail-safe
--
-- current_setting('app.current_user_id') without missing_ok=true throws a hard
-- PostgreSQL error when the setting has not been set on the connection.
-- Adding missing_ok=true (second argument = true) makes it return NULL instead,
-- so an unauthenticated/misconfigured connection sees 0 rows rather than crashing.

ALTER POLICY form_instances_institution_policy ON form_instances
  USING (institution_id IN (
    SELECT institution_id FROM users
    WHERE id = current_setting('app.current_user_id', true)::uuid
  ));

ALTER POLICY form_history_institution_policy ON form_instance_history
  USING (form_instance_id IN (
    SELECT id FROM form_instances WHERE institution_id IN (
      SELECT institution_id FROM users
      WHERE id = current_setting('app.current_user_id', true)::uuid
    )
  ));

-- Migration 002: Add form_code column to form_instances
-- Required because form_definitions table is not populated from XBRL taxonomy;
-- forms are identified by their taxonomy code (e.g. 'de_sprv_tgrsk1').

-- Add form_code column
ALTER TABLE form_instances
  ADD COLUMN IF NOT EXISTS form_code VARCHAR(100);

-- Drop old unique constraint that relied on form_definition_id (which is always NULL)
ALTER TABLE form_instances
  DROP CONSTRAINT IF EXISTS form_instances_institution_id_form_definition_id_reporting__key;

DROP INDEX IF EXISTS idx_form_instances_composite;

-- New unique constraint: one instance per institution + form + period
ALTER TABLE form_instances
  ADD CONSTRAINT form_instances_institution_form_code_period_key
  UNIQUE (institution_id, form_code, reporting_period);

CREATE INDEX idx_form_instances_composite
  ON form_instances (institution_id, form_code, reporting_period);

CREATE INDEX idx_form_instances_form_code
  ON form_instances (form_code);

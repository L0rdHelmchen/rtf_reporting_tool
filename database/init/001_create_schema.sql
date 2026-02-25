-- RTF Reporting Tool Database Schema
-- Deutsche Bundesbank RTF (Risk-Bearing Capacity) Reporting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE institution_type_enum AS ENUM (
    'bank',
    'savings_bank',
    'cooperative_bank',
    'building_society',
    'investment_firm',
    'other'
);

CREATE TYPE exemption_category_enum AS ENUM (
    'section_53b', -- § 53b KWG
    'section_53c', -- § 53c Abs. 1 Nr. 2 KWG
    'securities_trading_bank', -- Wertpapierhandelsbank
    'risk_management_exemption', -- § 2a Abs. 2/5 KWG
    'none'
);

CREATE TYPE form_category_enum AS ENUM (
    'GRP', 'RSK', 'RDP', 'ILAAP', 'KPL', 'STA', 'STKK', 'RTFK', 'STG', 'DBL', 'OTHER'
);

CREATE TYPE form_status_enum AS ENUM (
    'draft',
    'in_review',
    'submitted',
    'accepted',
    'rejected'
);

CREATE TYPE concept_data_type_enum AS ENUM (
    'si6', 'mi1', 'pi2', 'ii3', 'li1', 'di5',
    'bi7', 'ci1', 'ti1', 'url', 'mem', 'bool', 'date'
);

CREATE TYPE dimension_type_enum AS ENUM (
    'explicit',
    'typed'
);

CREATE TYPE period_type_enum AS ENUM (
    'instant',
    'duration'
);

CREATE TYPE balance_type_enum AS ENUM (
    'credit',
    'debit'
);

CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'compliance_officer',
    'risk_manager',
    'data_entry',
    'reviewer',
    'viewer'
);

-- Core tables
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bik VARCHAR(8) UNIQUE NOT NULL, -- Bankleitzahl
    institute_type institution_type_enum NOT NULL DEFAULT 'bank',
    exemption_category exemption_category_enum DEFAULT 'none',
    parent_institution_id UUID REFERENCES institutions(id),
    is_consolidated_reporting BOOLEAN DEFAULT false,
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(2) DEFAULT 'DE',
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'data_entry',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- XBRL Taxonomy structure
CREATE TABLE form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL, -- e.g., 'GRP31', 'RSK12'
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category form_category_enum NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '2023-12',
    effective_date DATE NOT NULL,
    valid_until DATE,
    schema_structure JSONB NOT NULL, -- XBRL schema metadata
    validation_rules JSONB NOT NULL, -- Business rules
    presentation_structure JSONB, -- UI layout info
    mandatory BOOLEAN DEFAULT true,
    applies_to_individual BOOLEAN DEFAULT true,
    applies_to_consolidated BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(code, version)
);

-- XBRL Dimensions
CREATE TABLE dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL, -- e.g., 'de_sprv_GRC'
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    type dimension_type_enum NOT NULL DEFAULT 'explicit',
    domain_code VARCHAR(100), -- Reference to domain
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(code, valid_from)
);

CREATE TABLE dimension_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dimension_id UUID REFERENCES dimensions(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL, -- e.g., 'de_sprv_x050'
    label_de VARCHAR(500) NOT NULL,
    label_en VARCHAR(500),
    parent_id UUID REFERENCES dimension_members(id),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_abstract BOOLEAN DEFAULT false,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(dimension_id, code, valid_from)
);

-- XBRL Concepts/Metrics
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL, -- e.g., 'de_sprv_ei61'
    name_de VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    data_type concept_data_type_enum NOT NULL,
    period_type period_type_enum NOT NULL DEFAULT 'instant',
    balance_type balance_type_enum,
    validation_pattern VARCHAR(500),
    unit_type VARCHAR(20) DEFAULT 'pure', -- EUR, pure, percent, etc.
    is_abstract BOOLEAN DEFAULT false,
    substitution_group VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(code)
);

-- User form instances (actual reporting data)
CREATE TABLE form_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    form_definition_id UUID REFERENCES form_definitions(id),
    reporting_period DATE NOT NULL, -- Stichtag
    status form_status_enum NOT NULL DEFAULT 'draft',
    form_data JSONB NOT NULL DEFAULT '{}', -- Actual form field values
    dimensional_data JSONB NOT NULL DEFAULT '{}', -- XBRL dimensional structure
    validation_errors JSONB DEFAULT '[]',
    submission_data JSONB, -- Generated XBRL data
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    version_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(institution_id, form_definition_id, reporting_period)
);

-- Audit trail for form changes
CREATE TABLE form_instance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_instance_id UUID REFERENCES form_instances(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'submitted', 'approved', etc.
    previous_data JSONB,
    new_data JSONB,
    change_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reference data for dropdowns/enumerations
CREATE TABLE reference_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_code VARCHAR(100) NOT NULL, -- e.g., 'AW', 'AX', 'BU'
    member_code VARCHAR(100) NOT NULL, -- e.g., 'x01', 'x02'
    label_de VARCHAR(500) NOT NULL,
    label_en VARCHAR(500),
    description_de TEXT,
    description_en TEXT,
    parent_member_code VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE NOT NULL,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(domain_code, member_code, valid_from)
);

-- Indexes for performance
CREATE INDEX idx_institutions_bik ON institutions(bik);
CREATE INDEX idx_institutions_type ON institutions(institute_type);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_form_definitions_category ON form_definitions(category);
CREATE INDEX idx_form_definitions_code ON form_definitions(code);
CREATE INDEX idx_form_instances_institution ON form_instances(institution_id);
CREATE INDEX idx_form_instances_period ON form_instances(reporting_period);
CREATE INDEX idx_form_instances_status ON form_instances(status);
CREATE INDEX idx_form_instances_composite ON form_instances(institution_id, form_definition_id, reporting_period);
CREATE INDEX idx_dimensions_code ON dimensions(code);
CREATE INDEX idx_dimension_members_dimension ON dimension_members(dimension_id);
CREATE INDEX idx_concepts_code ON concepts(code);
CREATE INDEX idx_concepts_data_type ON concepts(data_type);
CREATE INDEX idx_reference_data_domain ON reference_data(domain_code);
CREATE INDEX idx_form_instance_history_instance ON form_instance_history(form_instance_id);

-- JSONB indexes for form data queries
CREATE INDEX idx_form_instances_form_data_gin ON form_instances USING gin(form_data);
CREATE INDEX idx_form_instances_dimensional_data_gin ON form_instances USING gin(dimensional_data);

-- Row Level Security (RLS) setup
ALTER TABLE form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_instance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own institution's data)
CREATE POLICY form_instances_institution_policy ON form_instances
    FOR ALL TO rtf_user
    USING (institution_id IN (
        SELECT institution_id FROM users WHERE id = current_setting('app.current_user_id')::uuid
    ));

CREATE POLICY form_history_institution_policy ON form_instance_history
    FOR ALL TO rtf_user
    USING (form_instance_id IN (
        SELECT id FROM form_instances WHERE institution_id IN (
            SELECT institution_id FROM users WHERE id = current_setting('app.current_user_id')::uuid
        )
    ));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_definitions_updated_at BEFORE UPDATE ON form_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_instances_updated_at BEFORE UPDATE ON form_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- V5: Seed reference data for local development
-- Ministries, Departments, Funding Sources, SBD Templates

-- ══════════════════════════════════════════════════════════════════════════
-- MINISTRIES (5 Sri Lankan government ministries)
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO ministry (name, code) VALUES
    ('Ministry of Health', 'MOH'),
    ('Ministry of Education', 'MOE'),
    ('Ministry of Defence', 'MOD'),
    ('Ministry of Transport', 'MOT'),
    ('Ministry of Agriculture', 'MOA');

-- ══════════════════════════════════════════════════════════════════════════
-- DEPARTMENTS (2 per ministry = 10 total)
-- ══════════════════════════════════════════════════════════════════════════

-- Ministry of Health (id=1)
INSERT INTO department (name, ministry_id) VALUES
    ('Planning Division', 1),
    ('Procurement Unit', 1);

-- Ministry of Education (id=2)
INSERT INTO department (name, ministry_id) VALUES
    ('Infrastructure Development', 2),
    ('Supplies Division', 2);

-- Ministry of Defence (id=3)
INSERT INTO department (name, ministry_id) VALUES
    ('Logistics Division', 3),
    ('Engineering Branch', 3);

-- Ministry of Transport (id=4)
INSERT INTO department (name, ministry_id) VALUES
    ('Road Development', 4),
    ('Public Transport Division', 4);

-- Ministry of Agriculture (id=5)
INSERT INTO department (name, ministry_id) VALUES
    ('Irrigation & Water Management', 5),
    ('Research & Development', 5);

-- ══════════════════════════════════════════════════════════════════════════
-- FUNDING SOURCES (3 sources)
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO funding_source (name, source_type) VALUES
    ('Government Treasury', 'GOVERNMENT'),
    ('World Bank - IDA Credit', 'EXTERNAL_LOAN'),
    ('Asian Development Bank Grant', 'EXTERNAL_GRANT');

-- ══════════════════════════════════════════════════════════════════════════
-- SBD TEMPLATES (4 templates, one per ProcurementType)
-- ══════════════════════════════════════════════════════════════════════════
INSERT INTO sbd_template (name, procurement_type, version, is_active) VALUES
    ('SBD for Procurement of Goods – National', 'GOODS', '1.0', true),
    ('SBD for Procurement of Works – NCB', 'WORKS', '2.1', true),
    ('SBD for Procurement of Services – QCBS', 'SERVICES', '1.0', true),
    ('SBD for Selection of Consultants – QBS', 'CONSULTANCY', '1.2', true);

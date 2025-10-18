-- Fix employee_gear table issues
-- This script creates the table if it doesn't exist and fixes RLS policies

-- Create employee_gear table if it doesn't exist
CREATE TABLE IF NOT EXISTS employee_gear (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    torch BOOLEAN DEFAULT FALSE,
    rifle_make TEXT,
    rifle_model TEXT,
    rifle_serial_number TEXT,
    uniform_issue_date DATE,
    boots_issue_date DATE,
    parka_issue_date DATE,
    jersey_issue_date DATE,
    cap_issue_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id)
);

-- Enable RLS
ALTER TABLE employee_gear ENABLE ROW LEVEL SECURITY;

-- Add unique constraint if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'employee_gear_employee_id_key' 
        AND conrelid = 'employee_gear'::regclass
    ) THEN
        ALTER TABLE employee_gear ADD CONSTRAINT employee_gear_employee_id_key UNIQUE (employee_id);
    END IF;
END $$;

-- Create RLS policies for employee_gear
DROP POLICY IF EXISTS "Enable read access for all users" ON employee_gear;
CREATE POLICY "Enable read access for all users" ON employee_gear
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON employee_gear;
CREATE POLICY "Enable insert access for all users" ON employee_gear
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON employee_gear;
CREATE POLICY "Enable update access for all users" ON employee_gear
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON employee_gear;
CREATE POLICY "Enable delete access for all users" ON employee_gear
    FOR DELETE USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_employee_gear_updated_at ON employee_gear;
CREATE TRIGGER update_employee_gear_updated_at
    BEFORE UPDATE ON employee_gear
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample gear data for existing employees
INSERT INTO employee_gear (employee_id, torch, rifle_make, rifle_model, uniform_issue_date, boots_issue_date, parka_issue_date, jersey_issue_date, cap_issue_date, notes)
SELECT 
    e.id,
    CASE WHEN e.name LIKE '%FRANS%' OR e.name LIKE '%DANIEL%' THEN true ELSE false END as torch,
    CASE WHEN e.name LIKE '%FRANS%' OR e.name LIKE '%DANIEL%' THEN 'R1 Rifle' ELSE 'R4 Rifle' END as rifle_make,
    CASE WHEN e.name LIKE '%FRANS%' OR e.name LIKE '%DANIEL%' THEN 'R1-001' ELSE 'R4-001' END as rifle_model,
    '2024-01-01'::date as uniform_issue_date,
    '2024-01-01'::date as boots_issue_date,
    '2024-01-01'::date as parka_issue_date,
    '2024-01-01'::date as jersey_issue_date,
    '2024-01-01'::date as cap_issue_date,
    'Standard issue gear' as notes
FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM employee_gear eg WHERE eg.employee_id = e.id
)
ON CONFLICT (employee_id) DO NOTHING;

-- Show verification
SELECT 'Employee gear table created and populated' as status;

-- Show count of gear records
SELECT COUNT(*) as gear_records_count FROM employee_gear;

-- Show sample gear data
SELECT 
    e.name,
    eg.torch,
    eg.rifle_make,
    eg.rifle_model
FROM employee_gear eg
JOIN employees e ON e.id = eg.employee_id
LIMIT 5;

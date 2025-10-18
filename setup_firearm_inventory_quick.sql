-- Quick Setup Script for Firearm Inventory System
-- Run this script in your Supabase SQL Editor to create the firearm inventory system

-- Step 1: Create firearm_types table
CREATE TABLE IF NOT EXISTS firearm_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('handgun', 'shotgun', 'rifle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create firearms table
CREATE TABLE IF NOT EXISTS firearms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firearm_type_id UUID REFERENCES firearm_types(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    license_start_date DATE NOT NULL,
    license_expire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create firearm_assignments table
CREATE TABLE IF NOT EXISTS firearm_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firearm_id UUID REFERENCES firearms(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    assigned_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create the summary function
CREATE OR REPLACE FUNCTION get_firearm_inventory_summary()
RETURNS TABLE (
    total_firearms BIGINT,
    handguns BIGINT,
    shotguns BIGINT,
    rifles BIGINT,
    available_firearms BIGINT,
    assigned_firearms BIGINT,
    expiring_soon BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_firearms,
        COUNT(*) FILTER (WHERE ft.category = 'handgun') as handguns,
        COUNT(*) FILTER (WHERE ft.category = 'shotgun') as shotguns,
        COUNT(*) FILTER (WHERE ft.category = 'rifle') as rifles,
        COUNT(*) FILTER (WHERE f.status = 'available') as available_firearms,
        COUNT(*) FILTER (WHERE f.status = 'assigned') as assigned_firearms,
        COUNT(*) FILTER (WHERE f.license_expire_date <= CURRENT_DATE + INTERVAL '30 days') as expiring_soon
    FROM firearms f
    JOIN firearm_types ft ON f.firearm_type_id = ft.id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the details function
CREATE OR REPLACE FUNCTION get_firearm_details()
RETURNS TABLE (
    firearm_id UUID,
    serial_number VARCHAR,
    type_name VARCHAR,
    category VARCHAR,
    license_start_date DATE,
    license_expire_date DATE,
    status VARCHAR,
    assigned_employee_name VARCHAR,
    assigned_site_name VARCHAR,
    assigned_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id as firearm_id,
        f.serial_number,
        ft.type_name,
        ft.category,
        f.license_start_date,
        f.license_expire_date,
        f.status,
        e.name as assigned_employee_name,
        s.name as assigned_site_name,
        fa.assigned_date,
        (f.license_expire_date - CURRENT_DATE)::INTEGER as days_until_expiry
    FROM firearms f
    JOIN firearm_types ft ON f.firearm_type_id = ft.id
    LEFT JOIN firearm_assignments fa ON f.id = fa.firearm_id 
        AND fa.assigned_date = (
            SELECT MAX(fa2.assigned_date) 
            FROM firearm_assignments fa2 
            WHERE fa2.firearm_id = f.id
        )
    LEFT JOIN employees e ON fa.employee_id = e.id
    LEFT JOIN sites s ON fa.site_id = s.id
    ORDER BY ft.category, ft.type_name, f.serial_number;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Insert firearm types
INSERT INTO firearm_types (type_name, category) VALUES
('Glock 9MM par (9 x 19MM)', 'handgun'),
('Khan 12 GA', 'shotgun'),
('Shotgun', 'shotgun'),
('Khan 12 GA Shotguns', 'shotgun'),
('Galil .223 REM', 'rifle'),
('Galil .223 REM (5.56x45)', 'rifle'),
('Galil .223 (Carbine) Rifle', 'rifle'),
('Vektor LM 5.233 REM (5.56x45)', 'rifle'),
('Aero Precision .223 REM', 'rifle'),
('Norinco .223 REM (5.56x45)', 'rifle'),
('.223 Rifle SAR', 'rifle'),
('Vektor LM 4.223 REM', 'rifle'),
('Galil .223 (Rifle/Carbine)', 'rifle'),
('Galil 5.56x45mm', 'rifle')
ON CONFLICT (type_name) DO NOTHING;

-- Step 7: Insert sample firearms (just a few to test)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD209', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR688', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2053967', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2063245', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120180', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120177', '2021-05-26', '2026-05-25')
ON CONFLICT (serial_number) DO NOTHING;

-- Step 8: Grant permissions
GRANT ALL ON firearm_types TO authenticated;
GRANT ALL ON firearms TO authenticated;
GRANT ALL ON firearm_assignments TO authenticated;
GRANT EXECUTE ON FUNCTION get_firearm_inventory_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_firearm_details() TO authenticated;

-- Step 9: Enable RLS
ALTER TABLE firearm_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearm_assignments ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policies
CREATE POLICY "Allow all operations on firearm_types" ON firearm_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on firearms" ON firearms FOR ALL USING (true);
CREATE POLICY "Allow all operations on firearm_assignments" ON firearm_assignments FOR ALL USING (true);

-- Success message
SELECT 'Firearm Inventory System Setup Complete!' as status;

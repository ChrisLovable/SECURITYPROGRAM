-- Create Firearm Inventory System
-- This script creates tables and functions for managing firearm inventory

-- Create firearm_types table
CREATE TABLE IF NOT EXISTS firearm_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- 'handgun', 'shotgun', 'rifle'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create firearms table
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

-- Create firearm_assignments table
CREATE TABLE IF NOT EXISTS firearm_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firearm_id UUID REFERENCES firearms(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    assigned_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(firearm_id, employee_id, site_id) -- Prevent duplicate assignments
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_firearms_type ON firearms(firearm_type_id);
CREATE INDEX IF NOT EXISTS idx_firearms_status ON firearms(status);
CREATE INDEX IF NOT EXISTS idx_firearms_serial ON firearms(serial_number);
CREATE INDEX IF NOT EXISTS idx_firearm_assignments_firearm ON firearm_assignments(firearm_id);
CREATE INDEX IF NOT EXISTS idx_firearm_assignments_employee ON firearm_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_firearm_assignments_site ON firearm_assignments(site_id);

-- Create function to get firearm inventory summary
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

-- Create function to get firearm details with assignment info
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
        EXTRACT(DAYS FROM f.license_expire_date - CURRENT_DATE)::INTEGER as days_until_expiry
    FROM firearms f
    JOIN firearm_types ft ON f.firearm_type_id = ft.id
    LEFT JOIN firearm_assignments fa ON f.id = fa.firearm_id 
        AND fa.assigned_date = (
            SELECT MAX(assigned_date) 
            FROM firearm_assignments fa2 
            WHERE fa2.firearm_id = f.id
        )
    LEFT JOIN employees e ON fa.employee_id = e.id
    LEFT JOIN sites s ON fa.site_id = s.id
    ORDER BY ft.category, ft.type_name, f.serial_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to assign firearm to employee
CREATE OR REPLACE FUNCTION assign_firearm(
    firearm_id_param UUID,
    employee_id_param UUID,
    site_id_param UUID,
    assigned_by_param VARCHAR DEFAULT 'System Admin'
)
RETURNS BOOLEAN AS $$
DECLARE
    firearm_exists BOOLEAN;
    employee_exists BOOLEAN;
    site_exists BOOLEAN;
BEGIN
    -- Check if firearm exists and is available
    SELECT EXISTS(SELECT 1 FROM firearms WHERE id = firearm_id_param AND status = 'available') INTO firearm_exists;
    
    -- Check if employee exists
    SELECT EXISTS(SELECT 1 FROM employees WHERE id = employee_id_param) INTO employee_exists;
    
    -- Check if site exists
    SELECT EXISTS(SELECT 1 FROM sites WHERE id = site_id_param) INTO site_exists;
    
    IF NOT firearm_exists THEN
        RAISE EXCEPTION 'Firearm not found or not available for assignment';
    END IF;
    
    IF NOT employee_exists THEN
        RAISE EXCEPTION 'Employee not found';
    END IF;
    
    IF NOT site_exists THEN
        RAISE EXCEPTION 'Site not found';
    END IF;
    
    -- Update firearm status to assigned
    UPDATE firearms SET status = 'assigned', updated_at = NOW() WHERE id = firearm_id_param;
    
    -- Create assignment record
    INSERT INTO firearm_assignments (firearm_id, employee_id, site_id, assigned_by)
    VALUES (firearm_id_param, employee_id_param, site_id_param, assigned_by_param);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to unassign firearm
CREATE OR REPLACE FUNCTION unassign_firearm(firearm_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update firearm status to available
    UPDATE firearms SET status = 'available', updated_at = NOW() WHERE id = firearm_id_param;
    
    -- Note: We keep assignment history for audit purposes
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert firearm types based on the Excel data
INSERT INTO firearm_types (type_name, category) VALUES
-- Handguns
('Glock 9MM par (9 x 19MM)', 'handgun'),

-- Shotguns  
('Khan 12 GA', 'shotgun'),
('Shotgun', 'shotgun'),
('Khan 12 GA Shotguns', 'shotgun'),

-- Rifles
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

-- Insert firearms data from Excel
-- Galil .223 REM (25 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2053967', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2063245', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008076', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '1303500', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2014768', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008999', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2014570', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2012603', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2001641', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2010558', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2050455', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2069757', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2013997', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2024488', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2035693', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2067262', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2008494', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2051095', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2002300', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2042627', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '1303160', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2017417', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2057667', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2017398', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM'), '2057967', '2024-10-22', '2029-10-21');

-- Galil .223 REM (5.56x45) (4 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2049122', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2069318', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2054474', '2024-10-24', '2029-10-23'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 REM (5.56x45)'), '2059981', '2021-05-26', '2026-05-25');

-- Galil .223 (Carbine) Rifle (2 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Carbine) Rifle'), '2049986', '2022-05-27', '2027-05-26'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Carbine) Rifle'), '2072564', '2015-12-07', '2020-12-06');

-- Vektor LM 5.233 REM (5.56x45) (10 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664273/RS A563933', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664317/RS A564287', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664199/RS A582034', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664276/RS A564961', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA663596/RS A564739', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664297/RS A564439', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664234/RS A564746', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664299/RS A563928', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA663650/RS A564221', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 5.233 REM (5.56x45)'), 'RSA664286/RS A564466', '2024-01-29', '2029-01-29');

-- Glock 9MM par (9 x 19MM) (9 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD209', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR688', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR687', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR686', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD207', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD120', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BMRR689', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'TXB613', '2024-10-22', '2029-10-21'),
((SELECT id FROM firearm_types WHERE type_name = 'Glock 9MM par (9 x 19MM)'), 'BFRD206', '2024-10-22', '2029-10-21');

-- Aero Precision .223 REM (5 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097546', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097549', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X096105', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097532', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Aero Precision .223 REM'), 'X097537', '2021-05-26', '2026-05-25');

-- Norinco .223 REM (5.56x45) (4 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA270', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA301', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA290', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Norinco .223 REM (5.56x45)'), 'SPA304', '2024-01-29', '2029-01-29');

-- Khan 12 GA (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120180', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120177', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '16/PM120178', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120174', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120173', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120179', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120175', '2021-05-26', '2026-05-25'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA'), '19/PM120176', '2021-05-26', '2026-05-25');

-- .223 Rifle SAR (3 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'KT476502', '2015-12-07', '2020-12-06'),
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'AE495786', '2021-11-24', '2026-11-23'),
((SELECT id FROM firearm_types WHERE type_name = '.223 Rifle SAR'), 'AE495857', '2021-11-24', '2026-11-23');

-- Vektor LM 4.223 REM (1 firearm)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Vektor LM 4.223 REM'), 'RSA563613', '2024-10-22', '2029-10-21');

-- Shotgun (6 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00504', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00503', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00508', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00505', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00517', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Shotgun'), 'NOR00516', '2021-10-20', '2026-10-19');

-- Galil .223 (Rifle/Carbine) (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '1606808', '2021-10-12', '2026-10-11'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2017670', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2003069', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2053863', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2047072', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '1303617', '2021-10-20', '2026-10-19'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2050581', '2021-10-21', '2026-10-20'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil .223 (Rifle/Carbine)'), '2011176', '2021-10-22', '2026-10-21');

-- Galil 5.56x45mm (9 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2023000', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2073957', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2048091', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2051655', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2055287', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2038820', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2073267', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2028019', '2022-06-06', '2027-06-05'),
((SELECT id FROM firearm_types WHERE type_name = 'Galil 5.56x45mm'), '2020679', '2022-06-06', '2027-06-05');

-- Khan 12 GA Shotguns (8 firearms)
INSERT INTO firearms (firearm_type_id, serial_number, license_start_date, license_expire_date) VALUES
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1376', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1377', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1378', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1379', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1380', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1381', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1382', '2024-01-29', '2029-01-29'),
((SELECT id FROM firearm_types WHERE type_name = 'Khan 12 GA Shotguns'), 'BOS/1383', '2024-01-29', '2029-01-29');

-- Create updated_at trigger for firearms table
CREATE OR REPLACE FUNCTION update_firearms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_firearms_updated_at
    BEFORE UPDATE ON firearms
    FOR EACH ROW
    EXECUTE FUNCTION update_firearms_updated_at();

-- Create updated_at trigger for firearm_types table
CREATE TRIGGER trigger_update_firearm_types_updated_at
    BEFORE UPDATE ON firearm_types
    FOR EACH ROW
    EXECUTE FUNCTION update_firearms_updated_at();

-- Create updated_at trigger for firearm_assignments table
CREATE TRIGGER trigger_update_firearm_assignments_updated_at
    BEFORE UPDATE ON firearm_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_firearms_updated_at();

-- Grant necessary permissions
GRANT ALL ON firearm_types TO authenticated;
GRANT ALL ON firearms TO authenticated;
GRANT ALL ON firearm_assignments TO authenticated;
GRANT EXECUTE ON FUNCTION get_firearm_inventory_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_firearm_details() TO authenticated;
GRANT EXECUTE ON FUNCTION assign_firearm(UUID, UUID, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION unassign_firearm(UUID) TO authenticated;

-- Enable RLS (Row Level Security)
ALTER TABLE firearm_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearm_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on firearm_types" ON firearm_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on firearms" ON firearms FOR ALL USING (true);
CREATE POLICY "Allow all operations on firearm_assignments" ON firearm_assignments FOR ALL USING (true);

COMMENT ON TABLE firearm_types IS 'Types of firearms in inventory';
COMMENT ON TABLE firearms IS 'Individual firearms with serial numbers and license information';
COMMENT ON TABLE firearm_assignments IS 'Assignment history of firearms to employees and sites';
COMMENT ON FUNCTION get_firearm_inventory_summary() IS 'Returns summary statistics of firearm inventory';
COMMENT ON FUNCTION get_firearm_details() IS 'Returns detailed firearm information with current assignments';
COMMENT ON FUNCTION assign_firearm(UUID, UUID, UUID, VARCHAR) IS 'Assigns a firearm to an employee at a specific site';
COMMENT ON FUNCTION unassign_firearm(UUID) IS 'Unassigns a firearm and marks it as available';





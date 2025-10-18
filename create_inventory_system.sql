-- INVENTORY MANAGEMENT SYSTEM
-- Track firearms, torches, night vision equipment, vehicles, etc.

-- Create equipment categories enum
CREATE TYPE equipment_category AS ENUM (
    'firearm',
    'torch',
    'night_vision',
    'vehicle',
    'uniform',
    'protective_gear',
    'communication',
    'other'
);

-- Create equipment status enum
CREATE TYPE equipment_status AS ENUM (
    'available',
    'assigned',
    'maintenance',
    'damaged',
    'lost',
    'retired'
);

-- Create inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category equipment_category NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    asset_tag VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    supplier VARCHAR(255),
    warranty_expiry DATE,
    status equipment_status DEFAULT 'available',
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment assignments table (who has what)
CREATE TABLE IF NOT EXISTS equipment_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_by VARCHAR(255),
    return_date DATE,
    return_reason VARCHAR(255),
    assignment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(inventory_item_id, employee_id, assigned_date)
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    performed_by VARCHAR(255),
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory transactions table (track all movements)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'assigned', 'returned', 'maintenance', 'damaged', 'lost', 'retired'
    employee_id UUID REFERENCES employees(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON inventory_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_employee ON equipment_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_item ON equipment_assignments(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_item ON maintenance_records(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);

-- Create function to update equipment status based on assignments
CREATE OR REPLACE FUNCTION update_equipment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory item status based on assignment
    IF TG_OP = 'INSERT' THEN
        UPDATE inventory_items 
        SET status = 'assigned', updated_at = NOW()
        WHERE id = NEW.inventory_item_id;
        
        -- Create transaction record
        INSERT INTO inventory_transactions (inventory_item_id, transaction_type, employee_id, notes, created_by)
        VALUES (NEW.inventory_item_id, 'assigned', NEW.employee_id, NEW.assignment_notes, NEW.assigned_by);
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- If return_date is set, mark as returned
        IF NEW.return_date IS NOT NULL AND OLD.return_date IS NULL THEN
            UPDATE inventory_items 
            SET status = 'available', updated_at = NOW()
            WHERE id = NEW.inventory_item_id;
            
            -- Create transaction record
            INSERT INTO inventory_transactions (inventory_item_id, transaction_type, employee_id, notes, created_by)
            VALUES (NEW.inventory_item_id, 'returned', NEW.employee_id, NEW.return_reason, NEW.assigned_by);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for equipment assignments
DROP TRIGGER IF EXISTS equipment_assignment_trigger ON equipment_assignments;
CREATE TRIGGER equipment_assignment_trigger
    AFTER INSERT OR UPDATE ON equipment_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_status();

-- Create function to get current assignments for an employee
CREATE OR REPLACE FUNCTION get_employee_equipment(p_employee_id UUID)
RETURNS TABLE (
    item_id UUID,
    item_name VARCHAR(255),
    category equipment_category,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    assigned_date DATE,
    assignment_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.category,
        i.brand,
        i.model,
        i.serial_number,
        ea.assigned_date,
        ea.assignment_notes
    FROM inventory_items i
    JOIN equipment_assignments ea ON ea.inventory_item_id = i.id
    WHERE ea.employee_id = p_employee_id 
    AND ea.return_date IS NULL
    ORDER BY ea.assigned_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get equipment history for an item
CREATE OR REPLACE FUNCTION get_equipment_history(p_item_id UUID)
RETURNS TABLE (
    transaction_date TIMESTAMP WITH TIME ZONE,
    transaction_type VARCHAR(50),
    employee_name VARCHAR(255),
    notes TEXT,
    created_by VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        it.transaction_date,
        it.transaction_type,
        e.name,
        it.notes,
        it.created_by
    FROM inventory_transactions it
    LEFT JOIN employees e ON e.id = it.employee_id
    WHERE it.inventory_item_id = p_item_id
    ORDER BY it.transaction_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON inventory_items FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON equipment_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON equipment_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON equipment_assignments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON maintenance_records FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON inventory_transactions FOR INSERT WITH CHECK (true);

-- Insert sample inventory data
INSERT INTO inventory_items (name, category, brand, model, serial_number, asset_tag, status, location, notes) VALUES
-- Firearms
('Rifle - AK47', 'firearm', 'Kalashnikov', 'AK-47', 'AK001', 'F001', 'available', 'Armory', 'Standard issue rifle'),
('Rifle - R4', 'firearm', 'Denel', 'R4', 'R4001', 'F002', 'available', 'Armory', 'South African assault rifle'),
('Pistol - Glock', 'firearm', 'Glock', 'G17', 'GL001', 'F003', 'available', 'Armory', '9mm pistol'),
('Shotgun - Pump', 'firearm', 'Remington', '870', 'SG001', 'F004', 'available', 'Armory', '12 gauge shotgun'),

-- Torches
('LED Torch - High Power', 'torch', 'Maglite', 'ML300L', 'TL001', 'T001', 'available', 'Storage', 'High power LED torch'),
('Headlamp - Rechargeable', 'torch', 'Petzl', 'TACTIKKA', 'HL001', 'T002', 'available', 'Storage', 'Rechargeable headlamp'),
('Handheld Torch - Compact', 'torch', 'Fenix', 'PD36R', 'HT001', 'T003', 'available', 'Storage', 'Compact rechargeable torch'),

-- Night Vision
('Night Vision Goggles', 'night_vision', 'ATN', 'PVS-14', 'NV001', 'NV001', 'available', 'Armory', 'Monocular night vision'),
('Thermal Camera', 'night_vision', 'FLIR', 'TG165', 'TC001', 'NV002', 'available', 'Armory', 'Handheld thermal camera'),

-- Vehicles
('Patrol Vehicle - Toyota', 'vehicle', 'Toyota', 'Hilux', 'VIN123456', 'V001', 'available', 'Garage', 'White patrol vehicle'),
('Patrol Vehicle - Ford', 'vehicle', 'Ford', 'Ranger', 'VIN789012', 'V002', 'available', 'Garage', 'Blue patrol vehicle'),
('Motorcycle - Honda', 'vehicle', 'Honda', 'CRF250', 'MC001', 'V003', 'available', 'Garage', 'Patrol motorcycle'),

-- Uniforms
('Uniform Set - Summer', 'uniform', 'Bushveld', 'Summer', 'U001', 'U001', 'available', 'Storage', 'Complete summer uniform'),
('Uniform Set - Winter', 'uniform', 'Bushveld', 'Winter', 'U002', 'U002', 'available', 'Storage', 'Complete winter uniform'),
('Boots - Tactical', 'uniform', 'Magnum', 'Stealth', 'B001', 'U003', 'available', 'Storage', 'Tactical boots'),

-- Protective Gear
('Body Armor - Level III', 'protective_gear', 'Point Blank', 'Interceptor', 'BA001', 'PG001', 'available', 'Armory', 'Ballistic vest'),
('Helmet - Tactical', 'protective_gear', 'Ops-Core', 'FAST', 'H001', 'PG002', 'available', 'Armory', 'Tactical helmet'),
('Gas Mask - Full Face', 'protective_gear', 'MSA', 'G1', 'GM001', 'PG003', 'available', 'Armory', 'Full face gas mask'),

-- Communication
('Radio - Handheld', 'communication', 'Motorola', 'DP4400', 'R001', 'C001', 'available', 'Storage', 'Digital radio'),
('Radio - Base Station', 'communication', 'Motorola', 'DP4400', 'RB001', 'C002', 'available', 'Office', 'Base station radio'),
('Satellite Phone', 'communication', 'Thuraya', 'XT', 'SP001', 'C003', 'available', 'Office', 'Satellite communication'),

-- Other Equipment
('First Aid Kit', 'other', 'MediKit', 'Professional', 'FAK001', 'O001', 'available', 'Storage', 'Professional first aid kit'),
('Rope - Climbing', 'other', 'Petzl', 'Rad Line', 'R001', 'O002', 'available', 'Storage', 'Static climbing rope'),
('Binoculars - Military', 'other', 'Steiner', 'M22', 'B001', 'O003', 'available', 'Storage', 'Military grade binoculars');

-- Show verification
SELECT 'INVENTORY MANAGEMENT SYSTEM INSTALLED SUCCESSFULLY' as status;

-- Show inventory summary
SELECT 
    category,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE status = 'available') as available,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance,
    COUNT(*) FILTER (WHERE status = 'damaged') as damaged
FROM inventory_items
GROUP BY category
ORDER BY category;





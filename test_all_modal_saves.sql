-- Comprehensive test script for all modal save functions
-- Run this to verify all database operations work correctly

-- Test 1: Employee/Personal Information Modal Save
-- Check if employees table has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- Test updating an employee (if any exist)
DO $$
DECLARE
    employee_id UUID;
BEGIN
    -- Get first employee ID
    SELECT id INTO employee_id FROM employees LIMIT 1;
    
    IF employee_id IS NOT NULL THEN
        -- Test update
        UPDATE employees 
        SET updated_at = NOW()
        WHERE id = employee_id;
        
        RAISE NOTICE 'Employee update test: SUCCESS';
    ELSE
        RAISE NOTICE 'Employee update test: SKIPPED (no employees found)';
    END IF;
END $$;

-- Test 2: Site Information Modal Save
-- Check if sites table has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;

-- Test updating a site (if any exist)
DO $$
DECLARE
    site_id UUID;
BEGIN
    -- Get first site ID
    SELECT id INTO site_id FROM sites LIMIT 1;
    
    IF site_id IS NOT NULL THEN
        -- Test update with new fields
        UPDATE sites 
        SET 
            monthly_invoice_amount = 1000.00,
            bushveld_vehicle = true,
            owner_vehicle = false,
            assigned_guards = ARRAY['Test Guard 1', 'Test Guard 2'],
            dont_work_with_guards = ARRAY['Restricted Guard 1'],
            updated_at = NOW()
        WHERE id = site_id;
        
        RAISE NOTICE 'Site update test: SUCCESS';
    ELSE
        RAISE NOTICE 'Site update test: SKIPPED (no sites found)';
    END IF;
END $$;

-- Test 3: Firearm Inventory Modal Save
-- Check if firearms table exists and has required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'firearms' 
ORDER BY ordinal_position;

-- Test firearm status update (if any firearms exist)
DO $$
DECLARE
    firearm_id UUID;
BEGIN
    -- Get first firearm ID
    SELECT id INTO firearm_id FROM firearms LIMIT 1;
    
    IF firearm_id IS NOT NULL THEN
        -- Test status update
        UPDATE firearms 
        SET 
            status = 'maintenance',
            updated_at = NOW()
        WHERE id = firearm_id;
        
        -- Test new statuses
        UPDATE firearms 
        SET 
            status = 'police',
            updated_at = NOW()
        WHERE id = firearm_id;
        
        RAISE NOTICE 'Firearm update test: SUCCESS';
    ELSE
        RAISE NOTICE 'Firearm update test: SKIPPED (no firearms found)';
    END IF;
END $$;

-- Test 4: Check if assignment functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('assign_firearm', 'unassign_firearm', 'update_firearm_status')
AND routine_schema = 'public';

-- Test 5: Inventory Modal Save
-- Check if inventory_items table exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;

-- Test 6: Check if gear tables exist for Personal Information Modal
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('employee_gear', 'rest_periods', 'gear_assignments')
AND table_schema = 'public';

-- Final status
SELECT 'All modal save function tests completed!' as status;
SELECT 'Check the results above for any errors or missing tables/columns' as note;




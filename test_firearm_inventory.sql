-- Test Firearm Inventory System
-- Run this after setup_firearm_inventory_quick.sql to verify everything works

-- Test 1: Check if tables exist
SELECT 
    'firearm_types' as table_name, 
    COUNT(*) as record_count 
FROM firearm_types
UNION ALL
SELECT 
    'firearms' as table_name, 
    COUNT(*) as record_count 
FROM firearms
UNION ALL
SELECT 
    'firearm_assignments' as table_name, 
    COUNT(*) as record_count 
FROM firearm_assignments;

-- Test 2: Check firearm types
SELECT type_name, category FROM firearm_types ORDER BY category, type_name;

-- Test 3: Check firearms
SELECT 
    f.serial_number,
    ft.type_name,
    ft.category,
    f.status,
    f.license_expire_date
FROM firearms f
JOIN firearm_types ft ON f.firearm_type_id = ft.id
ORDER BY ft.category, f.serial_number;

-- Test 4: Test summary function
SELECT * FROM get_firearm_inventory_summary();

-- Test 5: Test details function
SELECT * FROM get_firearm_details() LIMIT 5;

-- If all tests pass, you should see:
-- - Tables with record counts
-- - Firearm types listed
-- - Sample firearms listed
-- - Summary statistics
-- - Detailed firearm information





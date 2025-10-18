-- Test script for firearm assignment integration
-- Run this to verify the Personal Information modal firearm assignment works

-- Test 1: Check if firearms exist and are available
SELECT 
  f.id as firearm_id,
  ft.type_name,
  ft.category,
  f.serial_number,
  f.status,
  f.license_start_date,
  f.license_expire_date
FROM firearms f
JOIN firearm_types ft ON f.firearm_type_id = ft.id
WHERE f.status = 'available'
ORDER BY ft.category, ft.type_name, f.serial_number
LIMIT 10;

-- Test 2: Check if employees exist
SELECT 
  id,
  name,
  employee_number,
  status
FROM employees
WHERE status = 'active'
LIMIT 5;

-- Test 3: Check if sites exist
SELECT 
  id,
  name,
  address
FROM sites
LIMIT 5;

-- Test 4: Test firearm assignment function
DO $$
DECLARE
    firearm_id UUID;
    employee_id UUID;
    site_id UUID;
    assignment_result BOOLEAN;
BEGIN
    -- Get first available firearm
    SELECT f.id INTO firearm_id 
    FROM firearms f 
    WHERE f.status = 'available' 
    LIMIT 1;
    
    -- Get first active employee
    SELECT e.id INTO employee_id 
    FROM employees e 
    WHERE e.status = 'active' 
    LIMIT 1;
    
    -- Get first site
    SELECT s.id INTO site_id 
    FROM sites s 
    LIMIT 1;
    
    IF firearm_id IS NOT NULL AND employee_id IS NOT NULL AND site_id IS NOT NULL THEN
        -- Test assignment
        SELECT assign_firearm(firearm_id, employee_id, site_id, 'Test Assignment') INTO assignment_result;
        
        IF assignment_result THEN
            RAISE NOTICE 'Firearm assignment test: SUCCESS';
            RAISE NOTICE 'Firearm ID: %', firearm_id;
            RAISE NOTICE 'Employee ID: %', employee_id;
            RAISE NOTICE 'Site ID: %', site_id;
        ELSE
            RAISE NOTICE 'Firearm assignment test: FAILED';
        END IF;
        
        -- Test unassignment
        SELECT unassign_firearm(firearm_id) INTO assignment_result;
        
        IF assignment_result THEN
            RAISE NOTICE 'Firearm unassignment test: SUCCESS';
        ELSE
            RAISE NOTICE 'Firearm unassignment test: FAILED';
        END IF;
    ELSE
        RAISE NOTICE 'Firearm assignment test: SKIPPED (missing data)';
        RAISE NOTICE 'Firearm ID: %', firearm_id;
        RAISE NOTICE 'Employee ID: %', employee_id;
        RAISE NOTICE 'Site ID: %', site_id;
    END IF;
END $$;

-- Test 5: Check firearm assignment history
SELECT 
  fa.id,
  fa.firearm_id,
  fa.employee_id,
  fa.site_id,
  fa.assigned_date,
  fa.assigned_by,
  e.name as employee_name,
  s.name as site_name,
  ft.type_name as firearm_type,
  f.serial_number
FROM firearm_assignments fa
JOIN employees e ON fa.employee_id = e.id
JOIN sites s ON fa.site_id = s.id
JOIN firearms f ON fa.firearm_id = f.id
JOIN firearm_types ft ON f.firearm_type_id = ft.id
ORDER BY fa.assigned_date DESC
LIMIT 5;

-- Test 6: Check if getFirearmsByEmployee function works
-- This would be tested in the application, but we can verify the data exists
SELECT 
  fa.employee_id,
  e.name as employee_name,
  COUNT(fa.firearm_id) as assigned_firearms
FROM firearm_assignments fa
JOIN employees e ON fa.employee_id = e.id
WHERE fa.assigned_date = CURRENT_DATE
GROUP BY fa.employee_id, e.name
ORDER BY assigned_firearms DESC;

-- Final status
SELECT 'Firearm assignment integration test completed!' as status;
SELECT 'Check the results above for any errors or missing data' as note;





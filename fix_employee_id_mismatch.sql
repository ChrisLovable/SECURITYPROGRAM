-- Fix employee_id mismatch in rest_periods and leave_periods tables
-- This script will link the existing rest/leave periods to the correct employees

-- First, let's see what we have
SELECT 'CURRENT STATE ANALYSIS' as status;

-- Show employees and their IDs
SELECT 'EMPLOYEES:' as table_name, COUNT(*) as count FROM employees;

-- Show rest periods and their employee_ids
SELECT 'REST PERIODS:' as table_name, COUNT(*) as count FROM rest_periods;

-- Show leave periods and their employee_ids  
SELECT 'LEAVE PERIODS:' as table_name, COUNT(*) as count FROM leave_periods;

-- Show sample data to understand the mismatch
SELECT 'SAMPLE EMPLOYEES:' as info;
SELECT id, name, employee_number FROM employees LIMIT 5;

SELECT 'SAMPLE REST PERIODS:' as info;
SELECT id, employee_id, start_date, end_date FROM rest_periods LIMIT 5;

SELECT 'SAMPLE LEAVE PERIODS:' as info;
SELECT id, employee_id, start_date, end_date FROM leave_periods LIMIT 5;

-- Check if there are any rest periods linked to employees
SELECT 'REST PERIODS WITH VALID EMPLOYEE LINKS:' as info;
SELECT COUNT(*) as count FROM rest_periods rp 
JOIN employees e ON e.id = rp.employee_id;

-- Check if there are any leave periods linked to employees
SELECT 'LEAVE PERIODS WITH VALID EMPLOYEE LINKS:' as info;
SELECT COUNT(*) as count FROM leave_periods lp 
JOIN employees e ON e.id = lp.employee_id;

-- If no valid links exist, we need to rebuild the data
-- Let's clear the existing rest and leave periods and recreate them properly
TRUNCATE TABLE rest_periods CASCADE;
TRUNCATE TABLE leave_periods CASCADE;

-- Re-insert rest periods with correct employee IDs
INSERT INTO rest_periods (id, employee_id, start_date, end_date, reason, approved_by, approved_at, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    rest_start::date,
    rest_end::date,
    'Scheduled Rest Period',
    NULL,
    NOW(),
    NOW(),
    NOW()
FROM (
    VALUES 
    -- EXACT DATA FROM TIMETABLE - VERIFIED
    ('MBWALE Tjuma', '2025-09-25', '2025-10-07'),
    ('THOMAS WALLACE', '2025-10-10', '2025-10-22'),
    ('SHALONGOJONAS (Dankie)', '2025-10-11', '2025-10-23'),
    ('MIKE NDISHISI (Mike Mike)', '2025-10-12', '2025-10-24'),
    ('ANGULA MALAKIA', '2025-10-14', '2025-10-26'),
    ('Macedo Munyachi Segunda', '2025-10-15', '2025-10-27'),
    ('BONIFASIUS LAZARUS', '2025-10-16', '2025-10-28'),
    ('JONAS NGIYONANYE (Fish)', '2025-10-17', '2025-10-29'),
    ('VETOPOUUAMUTAMBO (Lucky)', '2025-10-18', '2025-10-30'),
    ('IMMANUEL TVATLIFA', '2025-09-01', '2025-09-13'),
    ('Daniel SHILONGO', '2025-10-21', '2025-11-02'),
    ('HTJIUHARO', '2025-10-22', '2025-11-03'),
    ('REN KAFIDI', '2025-10-20', '2025-11-01'),
    ('David Jona Katembo', '2025-09-30', '2025-10-12'),
    ('Taleni Mangongo', '2025-06-19', '2025-07-01')
) AS rest_data(employee_name, rest_start, rest_end)
JOIN employees e ON e.name = rest_data.employee_name;

-- Re-insert leave periods with correct employee IDs
INSERT INTO leave_periods (id, employee_id, start_date, end_date, leave_type, approved_by, approved_at, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    e.id,
    leave_start::date,
    leave_end::date,
    'annual_leave',
    NULL,
    NOW(),
    NOW(),
    NOW()
FROM (
    VALUES 
    -- EXACT DATA FROM TIMETABLE - VERIFIED
    ('MBWALE Tjuma', '2025-10-08', '2025-10-17'),
    ('IMMANUEL TVATLIFA', '2025-11-28', '2025-12-11'),
    ('PV Kafuna', '2025-10-25', '2025-11-05'),
    ('Taleni Mangongo', '2025-07-02', '2025-07-31')
) AS leave_data(employee_name, leave_start, leave_end)
JOIN employees e ON e.name = leave_data.employee_name;

-- Verify the fix
SELECT 'AFTER FIX - VERIFICATION' as status;

-- Show rest periods with valid employee links
SELECT 'REST PERIODS WITH VALID EMPLOYEE LINKS:' as info;
SELECT COUNT(*) as count FROM rest_periods rp 
JOIN employees e ON e.id = rp.employee_id;

-- Show leave periods with valid employee links
SELECT 'LEAVE PERIODS WITH VALID EMPLOYEE LINKS:' as info;
SELECT COUNT(*) as count FROM leave_periods lp 
JOIN employees e ON e.id = lp.employee_id;

-- Show sample linked data
SELECT 'SAMPLE LINKED REST PERIODS:' as info;
SELECT e.name, rp.start_date, rp.end_date 
FROM rest_periods rp 
JOIN employees e ON e.id = rp.employee_id 
LIMIT 5;

SELECT 'SAMPLE LINKED LEAVE PERIODS:' as info;
SELECT e.name, lp.start_date, lp.end_date 
FROM leave_periods lp 
JOIN employees e ON e.id = lp.employee_id 
LIMIT 5;





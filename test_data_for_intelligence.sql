-- Test Data for Guard Intelligence System
-- Run this in your Supabase SQL Editor to see the system working

-- First, let's add some intelligence data to employees
UPDATE employees SET 
    firearm_certified = true,
    driver_licensed = true,
    seniority_level = 3,
    fatigue_score = 45,
    total_shifts_this_month = 15,
    total_nights_this_month = 8,
    experience_level = 'Veteran'
WHERE name IN ('Joseph Mbewe', 'Michael Brown', 'Sarah Johnson');

-- Add some intelligence data to sites
UPDATE sites SET 
    firearm_required = true,
    driver_required = true,
    risk_level = 3,
    min_guard_count = 2,
    distance_km_from_hq = 15.5
WHERE name IN ('Aliwal Noord', 'BA Treasury', 'Harmony Piggeries');

-- Add some test shift assignments for the next 30 days
INSERT INTO shift_assignments (employee_id, site_id, assigned_date, shift_type, notes)
SELECT 
    e.id,
    s.id,
    CURRENT_DATE + INTERVAL '7 days',
    'day',
    'Test assignment for intelligence'
FROM employees e, sites s
WHERE e.name IN ('Joseph Mbewe', 'Michael Brown', 'Sarah Johnson')
    AND s.name IN ('Aliwal Noord', 'BA Treasury', 'Harmony Piggeries');

-- Add some test leave periods
INSERT INTO leave_periods (employee_id, leave_type, start_date, end_date, reason, status)
SELECT 
    e.id,
    'annual_leave',
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '15 days',
    'Test leave period for intelligence',
    'approved'
FROM employees e
WHERE e.name IN ('Joseph Mbewe', 'Sarah Johnson');

-- Add some test rest periods
INSERT INTO leave_periods (employee_id, leave_type, start_date, end_date, reason, status)
SELECT 
    e.id,
    'rest_day',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '17 days',
    'Test rest period for intelligence',
    'approved'
FROM employees e
WHERE e.name IN ('Michael Brown');

-- Test the views to see if data appears
SELECT 'Testing v_daily_intelligence:' as test_name;
SELECT * FROM v_daily_intelligence WHERE starting_rest > 0 OR ending_rest > 0 OR starting_leave > 0 OR ending_leave > 0 LIMIT 5;

SELECT 'Testing v_predicted_rest:' as test_name;
SELECT * FROM v_predicted_rest LIMIT 5;

SELECT 'Testing v_coverage_conflicts:' as test_name;
SELECT * FROM v_coverage_conflicts LIMIT 5;

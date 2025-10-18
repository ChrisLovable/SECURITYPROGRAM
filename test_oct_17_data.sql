-- Quick Test: Check October 17, 2025 Data
-- This will help us see exactly what data exists for that date

-- Check if we have any rest periods that include October 17, 2025
SELECT 'Rest periods including Oct 17, 2025:' as info;
SELECT 
    e.name as employee_name,
    rp.start_date,
    rp.end_date,
    CASE 
        WHEN '2025-10-17'::date BETWEEN rp.start_date AND rp.end_date THEN 'YES - ON REST'
        ELSE 'NO'
    END as is_on_rest_oct_17
FROM rest_periods rp
JOIN employees e ON e.id = rp.employee_id
WHERE rp.start_date <= '2025-10-17'::date 
    AND rp.end_date >= '2025-10-17'::date
ORDER BY rp.start_date;

-- Check if we have any leave periods that include October 17, 2025
SELECT 'Leave periods including Oct 17, 2025:' as info;
SELECT 
    e.name as employee_name,
    lp.start_date,
    lp.end_date,
    CASE 
        WHEN '2025-10-17'::date BETWEEN lp.start_date AND lp.end_date THEN 'YES - ON LEAVE'
        ELSE 'NO'
    END as is_on_leave_oct_17
FROM leave_periods lp
JOIN employees e ON e.id = lp.employee_id
WHERE lp.start_date <= '2025-10-17'::date 
    AND lp.end_date >= '2025-10-17'::date
ORDER BY lp.start_date;

-- Check if we have any shift assignments for October 17, 2025
SELECT 'Shift assignments for Oct 17, 2025:' as info;
SELECT 
    e.name as employee_name,
    s.name as site_name,
    sa.shift_type
FROM shift_assignments sa
JOIN employees e ON e.id = sa.employee_id
JOIN sites s ON s.id = sa.site_id
WHERE sa.assigned_date = '2025-10-17'::date;

-- Check what dates we actually have data for
SELECT 'Available rest period dates:' as info;
SELECT 
    MIN(start_date) as earliest_rest_start,
    MAX(end_date) as latest_rest_end,
    COUNT(*) as total_rest_periods
FROM rest_periods;

SELECT 'Available leave period dates:' as info;
SELECT 
    MIN(start_date) as earliest_leave_start,
    MAX(end_date) as latest_leave_end,
    COUNT(*) as total_leave_periods
FROM leave_periods;

-- Test a date that should have data (like October 7, 2025 - FRANS DANIEL's rest start)
SELECT 'Data for Oct 7, 2025 (FRANS DANIEL rest start):' as info;
SELECT 
    e.name as employee_name,
    rp.start_date,
    rp.end_date,
    'REST PERIOD' as type
FROM rest_periods rp
JOIN employees e ON e.id = rp.employee_id
WHERE '2025-10-07'::date BETWEEN rp.start_date AND rp.end_date;





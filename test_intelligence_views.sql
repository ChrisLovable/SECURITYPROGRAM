-- Test Guard Intelligence with October 7, 2025
-- This date should show FRANS DANIEL going on rest

-- First, make sure we have the views
CREATE OR REPLACE VIEW v_daily_intelligence AS
WITH date_series AS (
    SELECT generate_series(
        '2025-10-01'::date,
        '2025-10-31'::date,
        INTERVAL '1 day'
    )::date as report_date
),
daily_employees AS (
    SELECT 
        de.report_date,
        COUNT(DISTINCT CASE WHEN rp.start_date <= de.report_date AND rp.end_date >= de.report_date THEN rp.employee_id END) as on_rest,
        COUNT(DISTINCT CASE WHEN lp.start_date <= de.report_date AND lp.end_date >= de.report_date THEN lp.employee_id END) as on_leave,
        COUNT(DISTINCT CASE WHEN sa.assigned_date = de.report_date THEN sa.employee_id END) as on_duty,
        COUNT(DISTINCT CASE WHEN rp.start_date = de.report_date THEN rp.employee_id END) as starting_rest,
        COUNT(DISTINCT CASE WHEN rp.end_date = de.report_date THEN rp.employee_id END) as ending_rest,
        COUNT(DISTINCT CASE WHEN lp.start_date = de.report_date THEN lp.employee_id END) as starting_leave,
        COUNT(DISTINCT CASE WHEN lp.end_date = de.report_date THEN lp.employee_id END) as ending_leave
    FROM date_series de
    LEFT JOIN rest_periods rp ON rp.start_date <= de.report_date AND rp.end_date >= de.report_date
    LEFT JOIN leave_periods lp ON lp.start_date <= de.report_date AND lp.end_date >= de.report_date
    LEFT JOIN shift_assignments sa ON sa.assigned_date = de.report_date
    GROUP BY de.report_date
)
SELECT 
    report_date,
    on_rest,
    on_leave,
    on_duty,
    starting_rest,
    ending_rest,
    starting_leave,
    ending_leave,
    (on_rest + on_leave) as total_absent,
    (on_rest + on_leave + on_duty) as total_employees
FROM daily_employees
ORDER BY report_date;

-- Test the view for October 7, 2025
SELECT 'Daily intelligence for Oct 7, 2025:' as info;
SELECT * FROM v_daily_intelligence 
WHERE report_date = '2025-10-07'::date;

-- Test the view for October 17, 2025
SELECT 'Daily intelligence for Oct 17, 2025:' as info;
SELECT * FROM v_daily_intelligence 
WHERE report_date = '2025-10-17'::date;

-- Show all October data
SELECT 'All October 2025 data:' as info;
SELECT * FROM v_daily_intelligence 
WHERE report_date >= '2025-10-01'::date 
    AND report_date <= '2025-10-31'::date
ORDER BY report_date;





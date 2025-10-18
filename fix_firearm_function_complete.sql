-- Complete fix for firearm function errors
-- Run this script to fix both the ambiguous column and EXTRACT function issues

DROP FUNCTION IF EXISTS get_firearm_details();

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_firearm_details() TO authenticated;

-- Test the function
SELECT 'Function fixed successfully!' as status;
SELECT * FROM get_firearm_details() LIMIT 3;




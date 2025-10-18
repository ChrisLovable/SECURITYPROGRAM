-- Add missing assignment functions to database
-- Run this script to add the assign/unassign functions

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION assign_firearm(UUID, UUID, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION unassign_firearm(UUID) TO authenticated;

-- Test the functions
SELECT 'Assignment functions created successfully!' as status;





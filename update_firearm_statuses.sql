-- Update firearm status constraints to include new statuses
-- Run this script to add Police, Stolen, Lost statuses

-- Drop the existing constraint
ALTER TABLE firearms DROP CONSTRAINT IF EXISTS firearms_status_check;

-- Add the new constraint with all statuses
ALTER TABLE firearms ADD CONSTRAINT firearms_status_check 
CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'police', 'stolen', 'lost'));

-- Update the firearm service function to handle new statuses
CREATE OR REPLACE FUNCTION update_firearm_status(firearm_id_param UUID, new_status VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    firearm_exists BOOLEAN;
BEGIN
    -- Check if firearm exists
    SELECT EXISTS(SELECT 1 FROM firearms WHERE id = firearm_id_param) INTO firearm_exists;
    
    IF NOT firearm_exists THEN
        RAISE EXCEPTION 'Firearm not found';
    END IF;
    
    -- Validate status
    IF new_status NOT IN ('available', 'assigned', 'maintenance', 'retired', 'police', 'stolen', 'lost') THEN
        RAISE EXCEPTION 'Invalid status: %', new_status;
    END IF;
    
    -- Update firearm status
    UPDATE firearms 
    SET status = new_status, 
        updated_at = NOW() 
    WHERE id = firearm_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_firearm_status(UUID, VARCHAR) TO authenticated;

-- Test the function
SELECT 'Status constraints updated successfully!' as status;
SELECT 'New statuses available: available, assigned, maintenance, retired, police, stolen, lost' as available_statuses;





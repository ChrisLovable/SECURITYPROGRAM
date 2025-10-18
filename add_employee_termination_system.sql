-- Add employee status management system
-- This allows "removing" employees while keeping their data for historical reference

-- First, let's check if we need to add a status column to employees table
-- (It should already exist, but let's make sure it has the right values)

-- Update the employee_status enum to include 'terminated' status
DO $$ 
BEGIN
    -- Check if 'terminated' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'terminated' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'employee_status')
    ) THEN
        -- Add 'terminated' to the enum
        ALTER TYPE employee_status ADD VALUE 'terminated';
    END IF;
END $$;

-- Update existing employees to have proper status
UPDATE employees 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- Create a function to "terminate" an employee (soft delete)
CREATE OR REPLACE FUNCTION terminate_employee(employee_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update employee status to terminated
    UPDATE employees 
    SET status = 'terminated', updated_at = NOW()
    WHERE id = employee_id_param;
    
    -- Return true if employee was found and updated
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to reactivate an employee
CREATE OR REPLACE FUNCTION reactivate_employee(employee_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update employee status to active
    UPDATE employees 
    SET status = 'active', updated_at = NOW()
    WHERE id = employee_id_param;
    
    -- Return true if employee was found and updated
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active employees only (for calculations)
CREATE OR REPLACE VIEW active_employees AS
SELECT * FROM employees WHERE status = 'active';

-- Create a view for terminated employees (for reference)
CREATE OR REPLACE VIEW terminated_employees AS
SELECT * FROM employees WHERE status = 'terminated';

-- Update the rest periods view to only include active employees
CREATE OR REPLACE VIEW active_rest_periods AS
SELECT rp.* 
FROM rest_periods rp
JOIN active_employees ae ON ae.id = rp.employee_id;

-- Update the leave periods view to only include active employees
CREATE OR REPLACE VIEW active_leave_periods AS
SELECT lp.* 
FROM leave_periods lp
JOIN active_employees ae ON ae.id = lp.employee_id;

-- Update the shift assignments view to only include active employees
CREATE OR REPLACE VIEW active_shift_assignments AS
SELECT sa.* 
FROM shift_assignments sa
JOIN active_employees ae ON ae.id = sa.employee_id;

-- Show current employee status distribution
SELECT 
    status,
    COUNT(*) as count,
    CASE 
        WHEN status = 'active' THEN '✅ Included in calculations'
        WHEN status = 'terminated' THEN '❌ Excluded from calculations (kept for reference)'
        ELSE '❓ Unknown status'
    END as description
FROM employees 
GROUP BY status
ORDER BY status;

-- Show some example terminated employees (if any exist)
SELECT 
    name,
    employee_number,
    status,
    updated_at as terminated_date
FROM terminated_employees
ORDER BY updated_at DESC
LIMIT 5;






-- ADD LEAVE BALANCE TRACKING SYSTEM
-- Each employee gets 21 leave days annually on January 1st

-- Add leave balance fields to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS annual_leave_balance INTEGER DEFAULT 21,
ADD COLUMN IF NOT EXISTS leave_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create leave balance history table for tracking
CREATE TABLE IF NOT EXISTS leave_balance_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    initial_balance INTEGER NOT NULL DEFAULT 21,
    used_leave INTEGER NOT NULL DEFAULT 0,
    current_balance INTEGER NOT NULL DEFAULT 21,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, year)
);

-- Create function to calculate leave balance for an employee
CREATE OR REPLACE FUNCTION calculate_leave_balance(p_employee_id UUID, p_year INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    current_year INTEGER;
    initial_balance INTEGER := 21;
    used_leave INTEGER := 0;
    calculated_balance INTEGER;
BEGIN
    -- Use provided year or current year
    current_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE));
    
    -- Calculate used leave for the year
    SELECT COALESCE(SUM(
        CASE 
            WHEN EXTRACT(YEAR FROM start_date) = current_year 
            THEN (end_date - start_date + 1)
            ELSE 0
        END
    ), 0) INTO used_leave
    FROM leave_periods 
    WHERE employee_id = p_employee_id 
    AND leave_type = 'annual_leave';
    
    -- Calculate balance
    calculated_balance := initial_balance - used_leave;
    
    -- Ensure balance doesn't go below 0
    IF calculated_balance < 0 THEN
        calculated_balance := 0;
    END IF;
    
    RETURN calculated_balance;
END;
$$ LANGUAGE plpgsql;

-- Create function to update leave balance for all employees
CREATE OR REPLACE FUNCTION update_all_leave_balances(p_year INTEGER DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    current_year INTEGER;
    emp_record RECORD;
    calculated_balance INTEGER;
BEGIN
    current_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE));
    
    -- Update leave balance for all active employees
    FOR emp_record IN 
        SELECT id FROM employees WHERE status = 'active'
    LOOP
        calculated_balance := calculate_leave_balance(emp_record.id, current_year);
        
        -- Update employee record
        UPDATE employees 
        SET annual_leave_balance = calculated_balance,
            leave_year = current_year
        WHERE id = emp_record.id;
        
        -- Insert or update leave balance history
        INSERT INTO leave_balance_history (employee_id, year, initial_balance, used_leave, current_balance)
        VALUES (emp_record.id, current_year, 21, 21 - calculated_balance, calculated_balance)
        ON CONFLICT (employee_id, year) 
        DO UPDATE SET 
            used_leave = 21 - calculated_balance,
            current_balance = calculated_balance,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset leave balances for new year (January 1st)
CREATE OR REPLACE FUNCTION reset_annual_leave_balances()
RETURNS VOID AS $$
DECLARE
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Reset all active employees to 21 days for new year
    UPDATE employees 
    SET annual_leave_balance = 21,
        leave_year = current_year
    WHERE status = 'active';
    
    -- Insert new year records in history
    INSERT INTO leave_balance_history (employee_id, year, initial_balance, used_leave, current_balance)
    SELECT id, current_year, 21, 0, 21
    FROM employees 
    WHERE status = 'active'
    ON CONFLICT (employee_id, year) 
    DO UPDATE SET 
        initial_balance = 21,
        used_leave = 0,
        current_balance = 21,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update leave balance when leave is taken
CREATE OR REPLACE FUNCTION trigger_update_leave_balance()
RETURNS TRIGGER AS $$
DECLARE
    new_balance INTEGER;
BEGIN
    -- Only process annual leave
    IF NEW.leave_type = 'annual_leave' THEN
        -- Calculate new balance for the employee
        new_balance := calculate_leave_balance(NEW.employee_id);
        
        -- Update employee's leave balance
        UPDATE employees 
        SET annual_leave_balance = new_balance
        WHERE id = NEW.employee_id;
        
        -- Update leave balance history
        INSERT INTO leave_balance_history (employee_id, year, initial_balance, used_leave, current_balance)
        VALUES (NEW.employee_id, EXTRACT(YEAR FROM NEW.start_date), 21, 21 - new_balance, new_balance)
        ON CONFLICT (employee_id, year) 
        DO UPDATE SET 
            used_leave = 21 - new_balance,
            current_balance = new_balance,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on leave_periods table
DROP TRIGGER IF EXISTS leave_balance_trigger ON leave_periods;
CREATE TRIGGER leave_balance_trigger
    AFTER INSERT OR UPDATE ON leave_periods
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_leave_balance();

-- Initialize leave balances for all existing employees
SELECT update_all_leave_balances();

-- Add RLS policies for leave_balance_history
ALTER TABLE leave_balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON leave_balance_history
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON leave_balance_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON leave_balance_history
    FOR UPDATE USING (true);

-- Show verification
SELECT 'LEAVE BALANCE SYSTEM INSTALLED SUCCESSFULLY' as status;

-- Show sample of leave balances
SELECT 
    e.name as employee_name,
    e.annual_leave_balance as available_leave,
    e.leave_year,
    COALESCE(lbh.used_leave, 0) as used_leave,
    COALESCE(lbh.current_balance, e.annual_leave_balance) as calculated_balance
FROM employees e
LEFT JOIN leave_balance_history lbh ON lbh.employee_id = e.id AND lbh.year = e.leave_year
WHERE e.status = 'active'
ORDER BY e.name
LIMIT 10;






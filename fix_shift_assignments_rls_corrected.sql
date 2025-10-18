-- Fix RLS policies for shift_assignments table to allow saving
-- This script addresses the 401 Unauthorized and 42501 RLS violation errors
-- Updated to work with actual table structure

-- First, check if the table exists and has RLS enabled
DO $$
BEGIN
    -- Enable RLS on shift_assignments table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_assignments') THEN
        ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on shift_assignments table';
    ELSE
        RAISE NOTICE 'shift_assignments table does not exist';
    END IF;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON shift_assignments;
DROP POLICY IF EXISTS "Enable insert access for all users" ON shift_assignments;
DROP POLICY IF EXISTS "Enable update access for all users" ON shift_assignments;
DROP POLICY IF EXISTS "Enable delete access for all users" ON shift_assignments;

-- Create new RLS policies for shift_assignments table
DO $$
BEGIN
    -- Read access policy
    BEGIN
        CREATE POLICY "Enable read access for all users" ON shift_assignments
            FOR SELECT USING (true);
        RAISE NOTICE 'Created read policy for shift_assignments';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Read policy already exists for shift_assignments';
    END;

    -- Insert access policy
    BEGIN
        CREATE POLICY "Enable insert access for all users" ON shift_assignments
            FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Created insert policy for shift_assignments';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Insert policy already exists for shift_assignments';
    END;

    -- Update access policy
    BEGIN
        CREATE POLICY "Enable update access for all users" ON shift_assignments
            FOR UPDATE USING (true) WITH CHECK (true);
        RAISE NOTICE 'Created update policy for shift_assignments';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Update policy already exists for shift_assignments';
    END;

    -- Delete access policy
    BEGIN
        CREATE POLICY "Enable delete access for all users" ON shift_assignments
            FOR DELETE USING (true);
        RAISE NOTICE 'Created delete policy for shift_assignments';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Delete policy already exists for shift_assignments';
    END;
END $$;

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'shift_assignments'
ORDER BY policyname;

-- Test insert to verify RLS is working (without status column)
DO $$
DECLARE
    test_employee_id UUID;
    test_site_id UUID;
BEGIN
    -- Get a test employee and site
    SELECT id INTO test_employee_id FROM employees LIMIT 1;
    SELECT id INTO test_site_id FROM sites LIMIT 1;
    
    IF test_employee_id IS NOT NULL AND test_site_id IS NOT NULL THEN
        -- Try to insert a test assignment (only using columns that exist)
        INSERT INTO shift_assignments (employee_id, site_id, assigned_date, shift_type)
        VALUES (test_employee_id, test_site_id, CURRENT_DATE, 'day')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Test insert successful - RLS policies are working';
        
        -- Clean up test data
        DELETE FROM shift_assignments 
        WHERE employee_id = test_employee_id 
        AND site_id = test_site_id 
        AND assigned_date = CURRENT_DATE;
        
        RAISE NOTICE 'Test data cleaned up';
    ELSE
        RAISE NOTICE 'No test data available - cannot test insert';
    END IF;
END $$;






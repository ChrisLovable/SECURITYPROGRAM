-- Quick fix: Disable RLS on shift_assignments table temporarily
-- This will allow saving to work while we debug the RLS policies

-- Check if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shift_assignments') THEN
        -- Disable RLS temporarily
        ALTER TABLE shift_assignments DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on shift_assignments table - saving should now work';
    ELSE
        RAISE NOTICE 'shift_assignments table does not exist';
    END IF;
END $$;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'shift_assignments';






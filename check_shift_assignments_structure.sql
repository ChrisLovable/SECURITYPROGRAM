-- Check the actual structure of shift_assignments table
-- This will help us understand what columns exist

-- First, let's see what columns are in the shift_assignments table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'shift_assignments'
ORDER BY ordinal_position;

-- Also check if the table exists
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'shift_assignments';






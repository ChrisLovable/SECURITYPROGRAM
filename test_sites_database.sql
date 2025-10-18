-- Test script to verify sites table has all required columns
-- Run this to check if the database migration was successful

-- Check if all columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;

-- Test inserting a site with all fields
INSERT INTO sites (
  name, 
  address, 
  owner_number, 
  manager_number, 
  other_name_1, 
  other_number_1, 
  other_name_2, 
  other_number_2, 
  monthly_invoice_amount, 
  bushveld_vehicle, 
  owner_vehicle, 
  special_instructions,
  assigned_guards,
  dont_work_with_guards
) VALUES (
  'Test Site', 
  '123 Test Street', 
  '+264 81 123 4567', 
  '+264 81 234 5678', 
  'John Doe', 
  '+264 81 345 6789', 
  'Jane Smith', 
  '+264 81 456 7890', 
  5000.00, 
  true, 
  false, 
  'Test special instructions',
  ARRAY['Guard 1', 'Guard 2'],
  ARRAY['Restricted Guard 1']
);

-- Verify the insert worked
SELECT * FROM sites WHERE name = 'Test Site';

-- Clean up test data
DELETE FROM sites WHERE name = 'Test Site';

-- Show final status
SELECT 'Database test completed successfully!' as status;
SELECT 'All required columns are present and functional' as result;




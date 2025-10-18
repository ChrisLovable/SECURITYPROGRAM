-- Add missing columns to sites table for complete site information
-- Run this script to add all the missing fields

-- Add contact person fields
ALTER TABLE sites ADD COLUMN IF NOT EXISTS owner_number VARCHAR(20);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS manager_number VARCHAR(20);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS other_name_1 VARCHAR(100);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS other_number_1 VARCHAR(20);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS other_name_2 VARCHAR(100);
ALTER TABLE sites ADD COLUMN IF NOT EXISTS other_number_2 VARCHAR(20);

-- Add financial and vehicle fields
ALTER TABLE sites ADD COLUMN IF NOT EXISTS monthly_invoice_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS bushveld_vehicle BOOLEAN DEFAULT FALSE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS owner_vehicle BOOLEAN DEFAULT FALSE;

-- Add guard management fields
ALTER TABLE sites ADD COLUMN IF NOT EXISTS assigned_guards TEXT[] DEFAULT '{}';
ALTER TABLE sites ADD COLUMN IF NOT EXISTS dont_work_with_guards TEXT[] DEFAULT '{}';

-- Update existing sites with default values
UPDATE sites SET 
  monthly_invoice_amount = 0,
  bushveld_vehicle = FALSE,
  owner_vehicle = FALSE
WHERE monthly_invoice_amount IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN sites.owner_number IS 'Primary contact number for site owner';
COMMENT ON COLUMN sites.manager_number IS 'Contact number for site manager';
COMMENT ON COLUMN sites.other_name_1 IS 'Name of additional contact person 1';
COMMENT ON COLUMN sites.other_number_1 IS 'Phone number of additional contact person 1';
COMMENT ON COLUMN sites.other_name_2 IS 'Name of additional contact person 2';
COMMENT ON COLUMN sites.other_number_2 IS 'Phone number of additional contact person 2';
COMMENT ON COLUMN sites.monthly_invoice_amount IS 'Monthly invoice amount in NAD/R';
COMMENT ON COLUMN sites.bushveld_vehicle IS 'Whether Bushveld provides vehicle for this site';
COMMENT ON COLUMN sites.owner_vehicle IS 'Whether site owner provides vehicle';
COMMENT ON COLUMN sites.assigned_guards IS 'Array of guard names currently assigned to this site';
COMMENT ON COLUMN sites.dont_work_with_guards IS 'Array of guard names that this site does not want to work with';

-- Test the changes
SELECT 'Sites table updated successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sites' 
ORDER BY ordinal_position;

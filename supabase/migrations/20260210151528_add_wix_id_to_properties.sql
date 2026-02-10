-- Add wix_id column to properties table for duplicate detection
-- This column stores the original Wix CMS ID to prevent duplicate imports

ALTER TABLE properties ADD COLUMN IF NOT EXISTS wix_id TEXT UNIQUE;

-- Create index for faster duplicate lookups
CREATE INDEX IF NOT EXISTS idx_properties_wix_id ON properties(wix_id);

-- Add comment for documentation
COMMENT ON COLUMN properties.wix_id IS 'Original Wix CMS property ID - used for migration duplicate detection';
